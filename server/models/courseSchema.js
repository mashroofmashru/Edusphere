const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['video', 'quiz', 'text'],
    default: 'video'
  },
  content: { type: String }, // For text content or extra notes
  videoUrl: { type: String },
  duration: { type: Number, default: 0 },
  isFreePreview: { type: Boolean, default: false },

  // Quiz specific fields
  questions: [{
    question: { type: String },
    options: [{ type: String }],
    correctAnswer: { type: Number } // Index of the correct option
  }]
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  subtitle: { type: String },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  thumbnail: {
    type: String, // URL to image
    default: 'default-course.jpg'
  },
  category: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to your User model
    required: true
  },
  sections: [sectionSchema],
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Draft'
  }
}, { timestamps: true });

// Virtual for total course duration
courseSchema.virtual('totalDuration').get(function () {
  let total = 0;
  this.sections.forEach(section => {
    section.lessons.forEach(lesson => {
      total += lesson.duration;
    });
  });
  return total;
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;