const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
    title: String,
    description: String,
    url: String, // URL of the stored PDF
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  });
  
  const PDF = mongoose.model('PDF', pdfSchema);
  
  module.exports = PDF;