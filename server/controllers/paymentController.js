const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
    }
    return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

const { enrollUserInCourse } = require('./userHelpers');
const Course = require('../models/courseSchema');

const fs = require('fs');
const path = require('path');

module.exports = {
    // ... existing createCheckoutSession ...
    createCheckoutSession: async (req, res) => {
        // ... (keep existing code for createCheckoutSession) ...
        try {
            const { courseId } = req.body;
            const userId = req.user.id;

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }

            const stripe = getStripe();

            const session = await stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ["card"],

                line_items: [
                    {
                        price_data: {
                            currency: "inr", // ✅ INR
                            product_data: {
                                name: course.title,
                                description: course.subtitle || course.title,
                            },
                            unit_amount: Math.round(course.price * 100), // ₹ → paise
                        },
                        quantity: 1,
                    },
                ],

                success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/course/${courseId}?status=success&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/course/${courseId}?status=cancel`,

                metadata: {
                    userId,
                    courseId,
                },
            });

            res.status(200).json({ success: true, url: session.url });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to create checkout session",
            });
        }
    },
    verifySession: async (req, res) => {
        try {
            const { sessionId } = req.body;
            const stripe = getStripe();
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            if (session.payment_status === 'paid') {
                const { userId, courseId } = session.metadata;
                await enrollUserInCourse(userId, courseId, session.id);
                res.status(200).json({ success: true, message: "Payment verified and user enrolled" });
            } else {
                res.status(400).json({ success: false, message: "Payment not completed" });
            }
        } catch (error) {
            console.error("Verification failed:", error);
            res.status(500).json({ success: false, message: "Verification failed" });
        }
    },
    webhook: async (req, res) => {
        const logFile = path.join(__dirname, '../webhook_debug.log');
        const log = (msg) => fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);

        log("Webhook received!");
        const stripe = getStripe();
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            log(`Signature verification failed: ${err.message}`);
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { userId, courseId } = session.metadata;

            try {
                await enrollUserInCourse(userId, courseId, session.id);
                log(`Enrollment SUCCESS: User ${userId}, Course ${courseId}, Payment ${session.id}`);
                console.log(`Enrollment triggered for User ${userId} and Course ${courseId} with Payment ID ${session.id}`);
            } catch (error) {
                log(`Enrollment FAILED: ${error.message}`);
                console.error('Failed to enroll user after payment:', error);
            }
        } else {
            log(`Received unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    }
};
