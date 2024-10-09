const users = require('../../../modules/UsersModule')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await users.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Email not found!' });
        }

        // Check if the password matches
        if (password) {
            // Return a success message, the token, and the user's role
            res.status(200).json({ 
                message: 'Logged in successfully!', 
                token: user.token, 
                role: user.role 
            });
        } else {
            res.status(400).json({ message: 'Incorrect password!' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
