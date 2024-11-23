const User = require('../../../modules/UsersModule'); // Adjust the path as necessary
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


// Function to add a new user (student)

exports.addStudent = async (req, res) => {
    try {
        const { username, email, password, phone, role, firstName, lastName ,educationLevel} = req.body;

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create a new student
        const student = new User({
            username,
            email,
            password,
            phone,
            role: role || 'user', // Default to 'user' if no role is provided
            firstName,
            lastName,
            educationLevel,
        });

        // Generate token
        const token = jwt.sign({ _id: student._id, role: student.role }, 'your_secret_key'); // Replace 'your_secret_key' with your actual secret key
        student.token = token;

        // Save student to the database
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
        const { username, email, password, phone , educationLevel} = req.body;

        const updatedStudent = await User.findByIdAndUpdate(
            req.params.id,
            {
                username,
                email,
                password,
                phone,
                educationLevel,
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

exports.editProfile = async (req, res) => {
    try {
      const { userId } = req.params; // ID of the user to update
      const { token } = req.headers; // Extract token from headers
  
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
  
      // Verify the token
      const decodedToken = jwt.verify(token, 'your_secret_key');
      const adminId = decodedToken._id;
  
      // Check if the logged-in user is an admin
      const adminUser = await User.findById(adminId);
      if (!adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only' });
      }
  
      // Fetch the user to update
      console.log('userId:', userId);

      const userToUpdate = await User.findById(userId);
      if (!userToUpdate) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Extract the fields to update from the request body
      const {
        username,
        email,
        firstName,
        lastName,
        phone,
        address,
        educationLevel,
      } = req.body;
  
      // Update allowed fields
      if (username) userToUpdate.username = username;
      if (email) userToUpdate.email = email;
      if (firstName) userToUpdate.firstName = firstName;
      if (lastName) userToUpdate.lastName = lastName;
      if (phone) userToUpdate.phone = phone;
      if (address) userToUpdate.address = { ...userToUpdate.address, ...address };
      if (educationLevel) userToUpdate.educationLevel = educationLevel;
  
      // Save the updated user
      const updatedUser = await userToUpdate.save();
  
      res.json({ message: 'User profile updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
  };
