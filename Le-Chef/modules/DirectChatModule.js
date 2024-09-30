const mongoose = require('mongoose');

const directChatMessageSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
  }],
  documents: [{
    type: String,
  }],
  audio: {
    data: Buffer,
    contentType: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const DirectChatMessage = mongoose.model('DirectChatMessage', directChatMessageSchema);

module.exports = DirectChatMessage;
