const Course = require('../models/courseSchema');
const Enrollment = require('../models/enrollmentSchema');
module.exports = {
    createCourse: async (req, res) => {
        try {
            // Check if instructor is approved
            const User = require('../models/userSchema');
            const user = await User.findById(req.user.id);

            if (user.instructorStatus !== 'approved') {
                return res.status(403).json({
                    success: false,
                    message: "Your instructor account is pending approval. Please complete your profile and wait for admin approval."
                });
            }

            const courseData = {
                ...req.body,
                sections: JSON.parse(req.body.sections),

                thumbnail: req.file ? req.file.path : 'default.jpg',
                instructor: req.user?.id || '64b0f1a2e4b0f1a2e4b0f1a2'
            };

            const newCourse = await Course.create(courseData);
            res.status(201).json({ success: true, data: newCourse });
        } catch (err) {
            console.log(err)
            res.status(400).json({ success: false, message: err.message });
        }
    },
    uploadVideo: (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: "No video file uploaded" });
            }
            const videoUrl = `${req.file.path.replace(/\\/g, "/")}`;
            res.status(200).json({ success: true, url: videoUrl });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Video upload failed" });
        }
    },
    getMyCourses: async (req, res) => {
        try {
            const courses = await Course.find({ instructor: req.user.id });
            console.log(courses)
            res.status(200).json({ success: true, courses });
        } catch (err) {
            res.status(500).json({ success: false, message: "Failed to fetch courses" });
        }
    },
    getEnrolledStudents: async (req, res) => {
        try {
            const instructorId = req.user.id;
            const Progress = require('../models/progressSchema');
            const courses = await Course.find({ instructor: instructorId }).select('_id title');
            const courseIds = courses.map(c => c._id);

            const enrollments = await Enrollment.find({ course: { $in: courseIds }, status: 'active' })
                .populate('user', 'name email')
                .populate('course', 'title');

            const enrolledStudentsList = await Promise.all(enrollments.map(async (e) => {
                const progress = await Progress.findOne({ user: e.user?._id, course: e.course?._id });
                return {
                    _id: e.user?._id,
                    name: e.user?.name,
                    email: e.user?.email,
                    courseTitle: e.course?.title,
                    courseId: e.course?._id,
                    enrolledAt: e.enrolledAt,
                    progress: progress ? progress.percentage : 0
                };
            }));

            res.status(200).json({ success: true, data: enrolledStudentsList.filter(s => s.name) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to fetch enrolled students" });
        }
    },
    updateCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            const instructorId = req.user.id;

            const course = await Course.findOne({ _id: courseId, instructor: instructorId });
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found or unauthorized" });
            }

            const updateData = { ...req.body };
            if (updateData.sections) {
                updateData.sections = JSON.parse(updateData.sections);
            }
            if (req.file) {
                updateData.thumbnail = req.file.path;
            }

            const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, { new: true });
            res.status(200).json({ success: true, data: updatedCourse });
        } catch (err) {
            console.error(err);
            res.status(400).json({ success: false, message: err.message });
        }
    },
    deleteCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            const instructorId = req.user.id;

            const course = await Course.findOneAndDelete({ _id: courseId, instructor: instructorId });
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found or unauthorized" });
            }

            res.status(200).json({ success: true, message: "Course deleted successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to delete course" });
        }
    },
    getDashboardStats: async (req, res) => {
        try {
            const instructorId = req.user.id;
            const Review = require('../models/reviewSchema');
            const courses = await Course.find({ instructor: instructorId });
            const courseIds = courses.map(c => c._id);

            const enrollments = await Enrollment.find({ course: { $in: courseIds }, status: 'active' }).populate('course');
            const reviews = await Review.find({ course: { $in: courseIds } });

            const totalStudents = enrollments.length;
            const totalRevenue = enrollments.reduce((acc, curr) => acc + (curr.course.price || 0), 0);
            const activeCourses = courses.length;

            const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

            // Chart Data 1: Enrollment Trend (Last 6 Months)
            // Enrollment is already required at the top
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const enrollmentTrend = [];
            const today = new Date();
            for (let i = 5; i >= 0; i--) {
                const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthName = months[monthDate.getMonth()];
                const year = monthDate.getFullYear();

                const count = enrollments.filter(e => {
                    const eDate = new Date(e.createdAt); // Assuming enrollments have createdAt
                    return eDate.getMonth() === monthDate.getMonth() && eDate.getFullYear() === year;
                }).length;

                enrollmentTrend.push({ name: monthName, enrollments: count });
            }

            // Chart Data 2: Course Performance (Top 5 by Revenue)
            const coursePerformance = courses.map(course => {
                const courseEnrollments = enrollments.filter(e => e.course._id.toString() === course._id.toString());
                const revenue = courseEnrollments.reduce((acc, curr) => acc + (curr.paidAmount || course.price || 0), 0);
                return {
                    name: course.title,
                    revenue: revenue,
                    students: courseEnrollments.length
                };
            }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

            res.status(200).json({
                success: true,
                stats: {
                    totalStudents,
                    totalRevenue,
                    activeCourses,
                    averageRating,
                    totalReviews: reviews.length,
                    enrollmentTrend,
                    coursePerformance
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
        }
    },
    getCourseReviews: async (req, res) => {
        try {
            const instructorId = req.user.id;
            const Review = require('../models/reviewSchema');
            const courses = await Course.find({ instructor: instructorId }).select('_id');
            const courseIds = courses.map(c => c._id);

            const reviews = await Review.find({ course: { $in: courseIds } })
                .populate('user', 'name')
                .populate('course', 'title thumbnail')
                .sort({ createdAt: -1 });

            res.status(200).json({ success: true, data: reviews });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to fetch reviews" });
        }
    }
};
