const Payment = require('../../../modules/PaymentModule');
const Video = require('../../../modules/VideosModule');
const Quiz = require('../../../modules/QuizzesModule');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../../modules/UsersModule');
const cloudinary = require('cloudinary').v2;
const PDF = require('../../../modules/PdfModule');
const path = require('path');


// Function to get all pending requests
exports.getPendingPayments = async (req, res) => {
    try {
      // Fetch only pending payments with method 'Cash' or 'Mobile Wallet'
      const payments = await Payment.find({
        status: 'pending',
        method: { $in: ['Cash', 'Mobile Wallet'] }, // Filter for Cash and E-Wallet
      }).populate('user', 'username email');
  
      const formattedPayments = payments.map((payment) => ({
        paymentId: payment._id,
        user: payment.user,
        amount: payment.amount,
        method: payment.method,
        contentType: payment.contentType,
        contentId: payment.contentId,
        paymentImageUrl: payment.method === 'Mobile Wallet' ? payment.paymentImageUrl : null, // Include image only for Mobile Wallet
        createdAt: payment.createdAt, // Add the createdAt f
      }));
  
      res.json({ message: 'Pending payment requests retrieved successfully', payments: formattedPayments });
    } catch (error) {
      console.error('Failed to fetch pending payments:', error);
      res.status(500).json({ message: 'Failed to fetch pending payments', error: error.message });
    }
  };
  



  // accept Payment Request 

  exports.acceptPaymentRequest = async (req, res) => {
    try {
      const { paymentId } = req.params; // ID of the payment request
  
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({ message: 'Payment request not found' });
      }
  
      if (payment.status !== 'pending') {
        return res.status(400).json({ message: 'Payment request has already been processed' });
      }
  
      // Update payment status to success
      payment.status = 'success';
  
      // Find the user and update their purchased content
      const user = await User.findById(payment.user);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.paidContent.push({
        contentId: payment.contentId,
        contentType: payment.contentType,
      });
  
      await user.save();
      await payment.save();
  
      res.json({ message: 'Payment request accepted successfully', payment });
    } catch (error) {
      console.error('Failed to accept payment request:', error);
      res.status(500).json({ message: 'Failed to accept payment request', error: error.message });
    }
  };
  

  exports.rejectPaymentRequest = async (req, res) => {
    try {
      const { paymentId } = req.params; // ID of the payment request
  
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({ message: 'Payment request not found' });
      }
  
      if (payment.status !== 'pending') {
        return res.status(400).json({ message: 'Payment request has already been processed' });
      }
  
      // Update payment status to failed
      payment.status = 'failed';
  
      await payment.save();
  
      res.json({ message: 'Payment request rejected successfully', payment });
    } catch (error) {
      console.error('Failed to reject payment request:', error);
      res.status(500).json({ message: 'Failed to reject payment request', error: error.message });
    }
  };
  