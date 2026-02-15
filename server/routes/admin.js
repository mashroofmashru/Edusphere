var express = require('express');
var router = express.Router();
const adminHelpers = require('../controllers/adminHelpers');
const { verifyLogin, verifyAdmin } = require('../middlewares/authMiddleware');

router.get('/users', verifyLogin, verifyAdmin, adminHelpers.getAllUsers);
router.delete('/users/:id', verifyLogin, verifyAdmin, adminHelpers.deleteUser);
router.patch('/users/:id/instructor-status', verifyLogin, verifyAdmin, adminHelpers.updateInstructorStatus);

router.get('/courses', verifyLogin, verifyAdmin, adminHelpers.getAllCourses);
router.patch('/courses/:id/status', verifyLogin, verifyAdmin, adminHelpers.updateCourseStatus);
router.delete('/courses/:id', verifyLogin, verifyAdmin, adminHelpers.deleteCourse);

router.get('/stats', verifyLogin, verifyAdmin, adminHelpers.getPlatformStats);
router.get('/enrollments', verifyLogin, verifyAdmin, adminHelpers.getAllEnrollments);

// Category Management
router.get('/categories', adminHelpers.getAllCategories);
router.post('/categories', verifyLogin, verifyAdmin, adminHelpers.addCategory);
router.delete('/categories/:id', verifyLogin, verifyAdmin, adminHelpers.deleteCategory);


// Message Management
router.get('/messages', verifyLogin, verifyAdmin, adminHelpers.getAllMessages);
router.post('/messages/reply', verifyLogin, verifyAdmin, adminHelpers.replyToMessage);

module.exports = router;
