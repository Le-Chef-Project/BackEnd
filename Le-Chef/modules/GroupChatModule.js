const mongoose = require('mongoose');
const groupChatMessageSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: [String],
    documents: [String],
    audio: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
});

const GroupChatMessage = mongoose.model('GroupChatMessage', groupChatMessageSchema);

module.exports = GroupChatMessage;
