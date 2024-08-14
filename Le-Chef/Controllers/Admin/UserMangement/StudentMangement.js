const User = require('../../../modules/UsersModule'); // Adjust the path as necessary
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


// Function to add a new user (student)
exports.addStudent = async (req, res) => {
    try {
        const { username, email, password, phone, role } = req.body;


        
        
        // Create a new student
        const student = new User({
            username,
            email,
            password,
            phone,
            role: role || 'user', // Default to 'user' if no role is provided
            
            
        });

        // Generate token
        const token = jwt.sign({ userId: student._id, role: student.role }, 'your_secret_key'); // Replace 'your_secret_key' with your actual secret key
        // Save token to user document
        student.token = token;

        await student.save();
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'user' }); // Fetch all users with role 'user'
        res.status(200).json(students);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;

        const updatedStudent = await User.findByIdAndUpdate(
            req.params.id,
            {
                username,
                email,
                password,
                phone,
                updated_at: Date.now(),
            },
            { new: true } // Return the updated document
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(updatedStudent);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const deletedStudent = await User.findByIdAndDelete(req.params.id);

        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
