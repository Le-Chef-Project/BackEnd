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
    type: Number, // Duration in minutes
    required: true,
  },
  startAt: {
    type: Date,
    required: true,
  },
  endAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/*quizSchema.pre('save', function(next) {
  // Automatically set the end time based on the start time and duration
  if (this.startAt && this.duration) {
    this.endAt = new Date(this.startAt.getTime() + this.duration * 60000);
  }
  next();
});
*/
const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
