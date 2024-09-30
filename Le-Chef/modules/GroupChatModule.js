const mongoose = require('mongoose');
const groupChatMessageSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
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
  audio: [{  // Changed to an array
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GroupChatMessage = mongoose.model('GroupChatMessage', groupChatMessageSchema);

module.exports = GroupChatMessage;
