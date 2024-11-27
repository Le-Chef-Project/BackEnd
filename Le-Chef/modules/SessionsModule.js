const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: String,
  date: {
    type: Date,
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  hostUrl: {
    type: String,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants:
   [{ type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
     }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;