const noteModel = require('../../../modules/NotesModule');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken'); // Assuming you're using JWT for tokens


exports.AddNote = async (req, res) => {
    try {

      const {content} = req.body;
      const token = req.headers.token
      const decoded = jwt.verify(token, 'your_secret_key'); // Replace with your actual secret key
      const teacherId = decoded._id; // Assuming '_id' contains the teacher's ID
      const note = new noteModel({
        content,
        teacher: teacherId })// Use the teacher's existing ID from the token});
      await note.save();
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };


  exports.getAllNotes = async (req, res) => {
    try {
        const notes = await noteModel.find().populate('teacher', 'username email');
        res.status(200).json(notes);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



exports.updateNote = async (req, res) => {
    try {
        const { content } = req.body;
        const updatedNote = await noteModel.findByIdAndUpdate(
            req.params.id,
            {
                content,
                updatedAt: Date.now()
            },
            { new: true } // Return the updated document
        );

        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.status(200).json(updatedNote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.deleteNote = async (req, res) => {
    try {
        const deletedNote = await noteModel.findByIdAndDelete(req.params.id);
        if (!deletedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
