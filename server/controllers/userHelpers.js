const Course = require('../models/courseSchema');
const User = require('../models/userSchema');
const Enroll = require('../models/enrollmentSchema');

const enrollUserInCourse = async (userId, courseId, paymentId = null) => {
    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");

    // Create Enrollment Record (source of truth)
    try {
        await Enroll.create({
            user: userId,
            course: courseId,
            paymentId
        });
    } catch (err) {
        if (err.code === 11000) {
            console.log("User already enrolled");
        } else {
            throw err;
        }
    }

    // Update Course students array (for easy lookup/count)
    if (!course.enrolledStudents.includes(userId)) {
        course.enrolledStudents.push(userId);
        await course.save();
    }

    // Update User enrolled courses array (for easy lookup)
    await User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: courseId } });
};

module.exports = {
    enrollUserInCourse,
    getCourseDetails: async (req, res) => {
        try {
            const course = await Course.findById(req.params.id)
                .populate('instructor', 'name email headline bio website linkedin')
                .populate('enrolledStudents', 'name email');

            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }

            let isEnrolled = false;
            // Check enrollment logic if user is logged in
            // Note: req.user might be attached by middleware if authenticated
            // We usually can't rely on req.user in a public route unless verifyLogin is optional or checked
            // Assuming this route might be public, we need to handle auth check safely
            // However, typically CourseDetail fetches via an authenticated endpoint if we want isEnrolled

            // Checking if the legacy array has it as fallback, but better to check Enrollment if we have user
            // In the current route structure, verifyLogin might be middleware. 
            // If the route is public, req.user is undefined.
            // If the frontend sends token, we might have req.user.

            // To be safe, we can leave the client logic or perform a check if req.user exists.

            if (req.user) {
                const enrollment = await Enroll.findOne({ user: req.user.id, course: req.params.id, status: 'active' });
                isEnrolled = !!enrollment;
            } else {
                // Fallback to array check if generic public access
                // But array check relies on user ID which we don't have.
                // So isEnrolled remains false.
            }

            // We return the course as data, but let's append isEnrolled to the response object or data
            // To avoid breaking existing structure, we can add it to the data object if it's a POJO, 
            // or just add it alongside data.
            // course is Mongoose document, need .toObject() or leand() to modify if we want to embed it.

            const courseData = course.toObject();
            courseData.isEnrolled = isEnrolled;

            res.status(200).json({ success: true, data: courseData });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to fetch course details" });
        }
    },
    getAllCourses: async (req, res) => {
        try {
            const { search, category } = req.query;
            let query = { status: 'Published' };

            if (search) {
                query.title = { $regex: search, $options: 'i' };
            }
            if (category && category !== 'All') {
                query.category = category;
            }

            const courses = await Course.find(query)
                .select('title subtitle price thumbnail category rating instructor')
                .populate('instructor', 'name');
            console.log(courses)
            res.status(200).json({ success: true, data: courses });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to fetch courses" });
        }
    },
    getMyCourses: async (req, res) => {
        try {
            const enrollments = await Enroll.find({ user: req.user.id, status: 'active' })
                .populate({
                    path: 'course',
                    select: 'title subtitle price thumbnail category rating instructor',
                    populate: { path: 'instructor', select: 'name' }
                });

            const enrolledCourses = enrollments.map(e => e.course).filter(c => c !== null);

            res.status(200).json({ success: true, data: enrolledCourses });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to fetch enrolled courses" });
        }
    },
    enrollCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            const userId = req.user.id;

            await enrollUserInCourse(userId, courseId);

            res.status(200).json({ success: true, message: "Enrolled successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message || "Enrollment failed" });
        }
    },
    getProgress: async (req, res) => {
        try {
            const Progress = require('../models/progressSchema');
            let progress = await Progress.findOne({ user: req.user.id, course: req.params.id });

            if (!progress) {
                progress = await Progress.create({ user: req.user.id, course: req.params.id, completedLessons: [] });
            }

            res.status(200).json({ success: true, data: progress });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to fetch progress" });
        }
    },
    updateProgress: async (req, res) => {
        try {
            const { lessonId } = req.body;
            const Progress = require('../models/progressSchema');
            const Course = require('../models/courseSchema');

            let progress = await Progress.findOne({ user: req.user.id, course: req.params.id });
            if (!progress) {
                progress = new Progress({ user: req.user.id, course: req.params.id, completedLessons: [] });
            }

            const index = progress.completedLessons.indexOf(lessonId);
            if (index === -1) {
                progress.completedLessons.push(lessonId);
            } else {
                progress.completedLessons.splice(index, 1);
            }

            // Calculate percentage
            const course = await Course.findById(req.params.id);
            let totalLessons = 0;
            course.sections.forEach(s => totalLessons += s.lessons.length);

            progress.percentage = totalLessons > 0 ? Math.round((progress.completedLessons.length / totalLessons) * 100) : 0;

            await progress.save();
            res.status(200).json({ success: true, data: progress });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to update progress" });
        }
    },
    addReview: async (req, res) => {
        try {
            const { rating, comment } = req.body;
            const courseId = req.params.id;
            const userId = req.user.id;
            const Review = require('../models/reviewSchema');

            // Check if enrolled
            const course = await Course.findById(courseId);
            if (!course.enrolledStudents.includes(userId)) {
                return res.status(403).json({ success: false, message: "Only enrolled students can leave reviews" });
            }

            // Create or update review
            const review = await Review.findOneAndUpdate(
                { user: userId, course: courseId },
                { rating, comment },
                { new: true, upsert: true }
            );

            // Update course rating
            const reviews = await Review.find({ course: courseId });
            const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

            course.rating = avgRating.toFixed(1);
            await course.save();

            res.status(200).json({ success: true, data: review });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to add review" });
        }
    },
    getCourseReviews: async (req, res) => {
        try {
            const Review = require('../models/reviewSchema');
            const reviews = await Review.find({ course: req.params.id })
                .populate('user', 'name')
                .sort({ createdAt: -1 });

            res.status(200).json({ success: true, data: reviews });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to fetch reviews" });
        }
    },
    getCertificate: async (req, res) => {
        try {
            const Certificate = require('../models/certificateSchema');
            const certificate = await Certificate.findOne({ user: req.user.id, course: req.params.id })
                .populate('user', 'name')
                .populate('course', 'title');

            if (!certificate) {
                return res.status(404).json({ success: false, message: "Certificate not found" });
            }

            res.status(200).json({ success: true, data: certificate });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to fetch certificate" });
        }
    },
    issueCertificate: async (req, res) => {
        try {
            const Progress = require('../models/progressSchema');
            const Certificate = require('../models/certificateSchema');
            const crypto = require('crypto');

            const progress = await Progress.findOne({ user: req.user.id, course: req.params.id });

            if (!progress || progress.percentage < 100) {
                return res.status(400).json({ success: false, message: "Course not yet completed" });
            }

            // Check if already exists
            let certificate = await Certificate.findOne({ user: req.user.id, course: req.params.id });
            if (certificate) {
                return res.status(200).json({ success: true, data: certificate });
            }

            const certId = `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

            certificate = await Certificate.create({
                user: req.user.id,
                course: req.params.id,
                certificateId: certId
            });

            res.status(201).json({ success: true, data: certificate });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to issue certificate" });
        }
    },
    getMyCertificates: async (req, res) => {
        try {
            const Certificate = require('../models/certificateSchema');
            const certificates = await Certificate.find({ user: req.user.id })
                .populate('course', 'title thumbnail');

            res.status(200).json({ success: true, data: certificates });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to fetch certificates" });
        }
    },
    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            if (!user) return res.status(404).json({ success: false, message: "User not found" });
            res.status(200).json({ success: true, data: user });
        } catch (err) {
            res.status(500).json({ success: false, message: "Failed to fetch profile" });
        }
    },
    updateProfile: async (req, res) => {
        try {
            const { name, headline, bio, website, linkedin } = req.body;
            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                { name, headline, bio, website, linkedin },
                { new: true, runValidators: true }
            ).select('-password');

            res.status(200).json({ success: true, data: updatedUser, message: "Profile updated successfully" });
        } catch (err) {
            res.status(500).json({ success: false, message: "Failed to update profile" });
        }
    }
};
