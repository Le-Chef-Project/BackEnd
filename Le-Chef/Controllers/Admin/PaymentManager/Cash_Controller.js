const Payment = require('../../../modules/PaymentModule');
const Video = require('../../../modules/VideosModule');
const Quiz = require('../../../modules/QuizzesModule');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../../modules/UsersModule');
const cloudinary = require('cloudinary').v2;
const PDF = require('../../../modules/PdfModule');
const path = require('path');



exports.initiateCashPayment = async (req, res) => {
    try {
      const { contentId } = req.params;
  
      // Extract token and verify user
      const token = req.headers.token;
      if (!token) return res.status(401).json({ message: 'No token provided' });
  
      const decodedToken = jwt.verify(token, 'your_secret_key');
      const userId = decodedToken._id;
  
      // Get the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Determine content type
      let amountToPay, contentType, content;
      const video = await Video.findById(contentId);
      if (video) {
        amountToPay = video.amountToPay;
        contentType = 'Video';
        content = video;
      } else {
        const quiz = await Quiz.findById(contentId);
        if (quiz) {
          amountToPay = quiz.amountToPay;
          contentType = 'Quiz';
          content = quiz;
        } else {
          const pdf = await PDF.findById(contentId);
          if (pdf) {
            amountToPay = pdf.amountToPay;
            contentType = 'PDF';
            content = pdf;
          }
        }
      }
  
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }
  
      // Create the cash payment request
      const payment = new Payment({
        user: userId,
        amount: parseFloat(amountToPay),
        status: 'pending',
        method: 'Cash',
        contentType,
        contentId,
      });
  
      await payment.save();
  
      res.json({ message: 'Cash payment request submitted successfully, awaiting admin approval', paymentId: payment._id });
    } catch (error) {
      console.error('Cash payment initiation failed:', error);
      res.status(500).json({ message: 'Cash payment initiation failed', error: error.message });
    }
  };
  