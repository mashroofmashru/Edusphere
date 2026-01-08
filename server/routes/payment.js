const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyLogin } = require('../middlewares/authMiddleware');

router.post('/create-checkout-session', verifyLogin, paymentController.createCheckoutSession);

// Webhook route - raw body is handled in app.js via req.rawBody
router.post('/webhook', paymentController.webhook);

module.exports = router;
