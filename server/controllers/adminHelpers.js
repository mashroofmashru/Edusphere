const User = require('../models/userSchema');
const Course = require('../models/courseSchema');
const Category = require('../models/categorySchema');
const Enrollment = require('../models/enrollmentSchema');
const Contact = require('../models/contactSchema');
const { sendEmail } = require('../utils/emailService');

module.exports = {
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find({}, 'name email role instructorStatus headline bio website linkedin');
            res.status(200).json({ success: true, data: users });
        } catch (err) {
            res.status(500).json({ success: false, message: "Failed to fetch users" });
        }
    },

    getAllCourses: async (req, res) => {
        try {
            const courses = await Course.find({})
                .populate('instructor', 'name email');
            res.status(200).json({ success: true, data: courses });
        } catch (err) {
            res.status(500).json({ success: false, message: "Failed to fetch courses" });
        }
    },

    deleteUser: async (req, res) => {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: "User deleted" });
        } catch (err) {
            res.status(500).json({ success: false, message: "Failed to delete user" });
        }
    },

    deleteCourse: async (req, res) => {
        try {
            await Course.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: "Course deleted" });
        } catch (err) {
            res.status(500).json({ success: false, message: "Failed to delete course" });
        }
    },

    updateCourseStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const course = await Course.findByIdAndUpdate(req.params.id, { status }, { new: true });
            res.status(200).json({ success: true, data: course });
        } catch (err) {
            res.status(500).json({ success: false, message: "Failed to update course status" });
        }
    },

    getPlatformStats: async (req, res) => {
        try {
            const usersCount = await User.countDocuments();
            const coursesCount = await Course.countDocuments();
            const enrollmentsCount = await Enrollment.countDocuments();

            // Calculate Revenue
            const courses = await Course.find({}, 'price enrolledStudents category');
            const totalRevenue = courses.reduce((acc, course) => acc + (course.price * course.enrolledStudents.length), 0);

            // Chart Data: Enrollments over time (Last 6 months)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            // Monthly Enrollments
            const monthlyEnrollments = await Enrollment.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sixMonthsAgo },
                        status: 'active'
                    }
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]);

            const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const enrollmentData = monthlyEnrollments.map(item => ({
                name: monthNames[item._id],
                enrollments: item.count
            }));

            // Chart Data: Course Categories
            const categoryData = await Course.aggregate([
                { $group: { _id: "$category", value: { $sum: 1 } } },
                { $project: { name: "$_id", value: 1, _id: 0 } }
            ]);

            res.status(200).json({
                success: true,
                data: {
                    users: usersCount,
                    courses: coursesCount,
                    enrollments: enrollmentsCount,
                    revenue: totalRevenue.toFixed(2),
                    enrollmentTrend: enrollmentData,
                    categoryDistribution: categoryData
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to fetch stats" });
        }
    },

    // Category Management
    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.find();
            res.status(200).json({ success: true, data: categories });
        } catch (err) {
            res.status(500).json({ success: false, message: "Failed to fetch categories" });
        }
    },

    addCategory: async (req, res) => {
        try {
            const { name, description } = req.body;
            if (!name) return res.status(400).json({ success: false, message: "Category name is required" });

            const slug = name.toLowerCase().split(' ').join('-');

            // Check if already exists
            const existing = await Category.findOne({ $or: [{ name }, { slug }] });
            if (existing) {
                return res.status(400).json({ success: false, message: "Category already exists" });
            }

            const category = await Category.create({ name, slug, description });
            res.status(201).json({ success: true, data: category });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to add category" });
        }
    },

    deleteCategory: async (req, res) => {
        try {
            await Category.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: "Category deleted" });
        } catch (err) {
            res.status(500).json({ success: false, message: "Failed to delete category" });
        }
    },

    getAllEnrollments: async (req, res) => {
        try {
            const enrollments = await Enrollment.find({ status: 'active' })
                .populate('user', 'name email')
                .populate('course', 'title');

            const enrollmentList = enrollments.map(e => ({
                studentName: e.user?.name,
                studentEmail: e.user?.email,
                courseTitle: e.course?.title,
                courseId: e.course?._id,
                enrolledAt: e.enrolledAt,
                paymentId: e.paymentId,
                status: e.status
            })).filter(e => e.studentName);

            res.status(200).json({ success: true, data: enrollmentList });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to fetch all enrollments" });
        }
    },

    getAllMessages: async (req, res) => {
        try {
            const messages = await Contact.find().sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: messages });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to fetch messages" });
        }
    },

    replyToMessage: async (req, res) => {
        try {
            const { messageId, replySubject, replyBody } = req.body;

            const contactMessage = await Contact.findById(messageId);
            if (!contactMessage) {
                return res.status(404).json({ success: false, message: "Message not found" });
            }

            // Send Email
            await sendEmail(contactMessage.email, replySubject, replyBody);

            // Update Status and Save Reply
            contactMessage.status = 'Replied';
            contactMessage.reply = {
                subject: replySubject,
                body: replyBody,
                repliedAt: new Date()
            };
            await contactMessage.save();

            res.status(200).json({ success: true, message: "Reply sent successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to send reply" });
        }
    },

    updateInstructorStatus: async (req, res) => {
        try {
            const { status } = req.body; // 'approved' or 'rejected'
            const userId = req.params.id;

            if (!['approved', 'rejected', 'pending'].includes(status)) {
                return res.status(400).json({ success: false, message: "Invalid status" });
            }

            const user = await User.findByIdAndUpdate(userId, { instructorStatus: status }, { new: true });

            // Optionally send email notification here

            res.status(200).json({ success: true, message: `Instructor ${status} successfully`, data: user });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to update instructor status" });
        }
    }
};
