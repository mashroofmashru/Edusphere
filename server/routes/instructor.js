var express = require('express');
const upload = require('../config/uploads');
const instructorHelpers = require('../controllers/instructorHelpers');
const { verifyLogin, verifyAdmin } = require('../middlewares/authMiddleware');
var router = express.Router();


const videoUpload = require('../config/videoUploads');

router.post('/create', verifyLogin, upload.single('thumbnail'), instructorHelpers.createCourse);
router.post('/upload-video', verifyLogin, videoUpload.single('video'), instructorHelpers.uploadVideo);
router.get('/my-courses', verifyLogin, instructorHelpers.getMyCourses);
router.get('/enrolled-students', verifyLogin, instructorHelpers.getEnrolledStudents);
router.patch('/edit/:id', verifyLogin, upload.single('thumbnail'), instructorHelpers.updateCourse);
router.delete('/course/:id', verifyLogin, instructorHelpers.deleteCourse);


module.exports = router;