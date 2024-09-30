const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: [3, 'Username is too short'],
        maxlength: [20, 'Username is too long'],
        trim: true, // To handle name before save from leading and trailing whitespaces
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'], // Checks if the email has a valid format
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password is too short'],
    },
    firstName: {
        type: String,
        required: true, // First name is now required
        trim: true, // Handles leading and trailing whitespaces
    },
    lastName: {
        type: String,
        required: true, // Last name is now required
        trim: true, // Handles leading and trailing whitespaces
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Add more roles as needed
        default: 'user',
    },
    phone: {
        type: String,
        trim: true,
    },
    address: {
        apartment: {
            type: String,
            default: 'NA',
        },
        floor: {
            type: String,
            default: 'NA',
        },
        building: {
            type: String,
            default: 'NA',
        },
        street: {
            type: String,
            default: 'NA',
        },
        city: {
            type: String,
            default: 'NA',
        },
        state: {
            type: String,
            default: 'NA',
        },
        zip_code: {
            type: String,
            default: 'NA',
        },
        country: {
            type: String,
            default: 'NA',
        },
    },
    token: {
        type: String,
    },
    image: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
