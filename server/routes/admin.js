var express = require('express');
var router = express.Router();
const adminHelpers = require('../controllers/adminHelpers');
const { verifyLogin, verifyAdmin } = require('../middlewares/authMiddleware');

router.get('/users', verifyLogin, verifyAdmin, adminHelpers.getAllUsers);
router.delete('/users/:id', verifyLogin, verifyAdmin, adminHelpers.deleteUser);

router.get('/courses', verifyLogin, verifyAdmin, adminHelpers.getAllCourses);
router.patch('/courses/:id/status', verifyLogin, verifyAdmin, adminHelpers.updateCourseStatus);
router.delete('/courses/:id', verifyLogin, verifyAdmin, adminHelpers.deleteCourse);

router.get('/stats', verifyLogin, verifyAdmin, adminHelpers.getPlatformStats);

// Category Management
router.get('/categories', adminHelpers.getAllCategories); // Public potentially, but admin can manage
router.post('/categories', verifyLogin, verifyAdmin, adminHelpers.addCategory);
router.delete('/categories/:id', verifyLogin, verifyAdmin, adminHelpers.deleteCategory);

module.exports = router;