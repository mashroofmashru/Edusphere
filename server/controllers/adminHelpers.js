const User = require('../models/userSchema');
const Course = require('../models/courseSchema');
const Category = require('../models/categorySchema');
const Enrollment = require('../models/enrollmentSchema');

module.exports = {
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find({}, 'name email role');
            res.status(200).json({ success: true, data: users });
        } catch (err) {
            res.status(500).json({ success: false, message: "Failed to fetch users" });
        }
    },

    getAllCourses: async (req, res) => {
        try {
            const courses = await Course.find({})
                .populate('instructor', 'name email')
                .select('title category price status instructor thumbnail');
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

            // For now, let's just count total enrollments as a proxy for revenue if Stripe isn't fully logged in DB yet
            // Or better, calculate revenue from courses (price * enrollments.length)
            const courses = await Course.find({}, 'price enrolledStudents');
            const totalRevenue = courses.reduce((acc, course) => acc + (course.price * course.enrolledStudents.length), 0);

            res.status(200).json({
                success: true,
                data: {
                    users: usersCount,
                    courses: coursesCount,
                    revenue: totalRevenue.toFixed(2)
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
                enrolledAt: e.enrolledAt
            })).filter(e => e.studentName);

            res.status(200).json({ success: true, data: enrollmentList });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to fetch all enrollments" });
        }
    }
};