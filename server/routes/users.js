var express = require('express');
var router = express.Router();

const userHelpers = require('../controllers/userHelpers');
const { verifyLogin, optionalAuth } = require('../middlewares/authMiddleware');

router.get('/stats', userHelpers.getPublicStats);

router.get('/all-courses', userHelpers.getAllCourses);
router.get('/my-courses', verifyLogin, userHelpers.getMyCourses);
router.get('/course/:id', optionalAuth, userHelpers.getCourseDetails);
router.post('/course/:id/enroll', verifyLogin, userHelpers.enrollCourse);

router.get('/course/:id/progress', verifyLogin, userHelpers.getProgress);
router.patch('/course/:id/progress', verifyLogin, userHelpers.updateProgress);

router.post('/course/:id/review', verifyLogin, userHelpers.addReview);
router.get('/course/:id/reviews', userHelpers.getCourseReviews);

router.get('/course/:id/certificate', verifyLogin, userHelpers.getCertificate);
router.post('/course/:id/certificate', verifyLogin, userHelpers.issueCertificate);

router.get('/certificates', verifyLogin, userHelpers.getMyCertificates);

// Profile management
router.get('/profile', verifyLogin, userHelpers.getProfile);
router.put('/profile/update', verifyLogin, userHelpers.updateProfile);

const aiController = require('../controllers/aiController');
router.post('/ai-chat', verifyLogin, aiController.chatWithAI);

router.post('/contact', userHelpers.submitContactMessage);

module.exports = router;
