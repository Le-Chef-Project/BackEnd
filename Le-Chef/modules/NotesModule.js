const mongoose = require('mongoose');
const timezonePlugin = require('../timezonePlugin');

const noteSchema = new mongoose.Schema({
  content: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, { id: false }); // Disable the automatic `id` virtual property

// Use the plugin with the timezone
noteSchema.plugin(timezonePlugin, { timezone: 'Africa/Cairo' });

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
