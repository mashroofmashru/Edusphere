const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'instructor'],
    default: 'user'
  },
  headline: { type: String, trim: true },
  bio: { type: String, trim: true },
  website: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 3
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;