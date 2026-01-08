var express = require('express');
var router = express.Router();

const userHelpers = require('../controllers/userHelpers');
const { verifyLogin, optionalAuth } = require('../middlewares/authMiddleware');

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

module.exports = router;
