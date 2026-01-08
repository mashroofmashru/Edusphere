var express = require('express');
const authHelpers = require('../controllers/authHelpers');
var router = express.Router();

//auth routers
router.post('/dosignup', authHelpers.doSignup);
router.post('/doLogin', authHelpers.doLogin);

module.exports = router;