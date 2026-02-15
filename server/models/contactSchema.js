const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['New', 'Replied'],
        default: 'New'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    reply: {
        subject: String,
        body: String,
        repliedAt: Date
    }
});

module.exports = mongoose.model('Contact', contactSchema);
