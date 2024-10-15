const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  questions: [{
    question: {
      type: String,
      required: true,
    },
    options: [{
      type: String,
      required: true,
    }],
    answer: {
      type: String,
      required: true,
    },
  }],
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  duration: {
    hours: {
      type: Number,
      required: true,
      min: 0, // Hours can't be negative
    },
    minutes: {
      type: Number,
      required: true,
      min: 0,
      max: 59, // Minutes should be between 0 and 59
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
