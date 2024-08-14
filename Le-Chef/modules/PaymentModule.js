const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'Amount must be positive']
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    method: {
        type: String,
        enum: ['credit_card', 'paypal'], // Add more payment methods as needed
        required: true
    },
    contentType: {
        type: String,
        enum: ['video', 'quiz'], // Type of content being paid for
        required: true
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'contentType',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true // This will automatically add createdAt and updatedAt fields
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;