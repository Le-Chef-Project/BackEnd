const jwt = require('jsonwebtoken');
const User = require('../modules/UsersModule'); // Adjust the path as necessary

// Middleware to authenticate users based on token
exports.authenticateUser = async (req, res, next) => {
    try {
        const token = req.header
        const decoded = jwt.verify(token, 'your_secret_key'); // Replace with your actual secret key
        const user = await User.findOne({ _id: decoded.userId, token: token });

        if (!user) {
            throw new Error('Authentication failed');
        }

        req.user = user; // Attach the user to the request
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate.' });
    }
};
