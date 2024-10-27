const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Title is required
  },
  description: {
    type: String,
    required: true, // Description is required
  },
  isLocked: {
    type: Boolean,
    default: true, // Default to locked
  },
  url: {
    type: String,
    required: true, // URL is required
  },
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true, // Teacher reference is required
  },
  educationLevel: {
    type: Number,
    enum: [1, 2, 3], // Define levels as required
    required: true,
  },
  amountToPay: {
    type: Number,
    required: function() { return this.paid; }, // Required if video is paid
  },
  paid: {
    type: Boolean,
    default: true, // Default to false (indicating the video is free)
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
