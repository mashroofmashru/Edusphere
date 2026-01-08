const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
    }
    return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

const { enrollUserInCourse } = require('./userHelpers');
const Course = require('../models/courseSchema');

module.exports = {
    createCheckoutSession: async (req, res) => {
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

                // 🔥 Enables UPI, Cards, Wallets automatically (India-friendly)
                automatic_payment_methods: {
                    enabled: true,
                },

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

                success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/course/${courseId}?status=success`,
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
    webhook: async (req, res) => {
        const stripe = getStripe();
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { userId, courseId } = session.metadata;

            try {
                await enrollUserInCourse(userId, courseId, session.id);
                console.log(`Enrollment triggered for User ${userId} and Course ${courseId} with Payment ID ${session.id}`);
            } catch (error) {
                console.error('Failed to enroll user after payment:', error);
            }
        }

        res.status(200).json({ received: true });
    }
};
