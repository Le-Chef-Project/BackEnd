const Payment = require('../../../modules/PaymentModule');
const Video = require('../../../modules/VideosModule');
const Quiz = require('../../../modules/QuizzesModule');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../../modules/UsersModule');
const cloudinary = require('cloudinary').v2;
const PDF = require('../../../modules/PdfModule');
const path = require('path');
const Notification = require('../../../modules/NotificationsModule'); 
exports.initiateEWalletPayment = async (req, res) => {
  try {
    // Validate input
    const { contentId } = req.params;  // contentId is the ID of the content (video/quiz/pdf)
    const paymentImage = req.file; // Get the uploaded file

    // Check if a file is uploaded
    if (!paymentImage) {
      return res.status(400).json({ message: 'No payment image uploaded' });
    }

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

    // Determine content type (Video, Quiz, or PDF) and retrieve the corresponding content details
    let amountToPay;
    let contentType;
    let contentTitle;

    // Check for video content first
    const video = await Video.findById(contentId);
    if (video) {
      amountToPay = video.amountToPay;
      contentType = 'Video';
      contentTitle = video.title;  // Get the video title
    } else {
      // Check for quiz content
      const quiz = await Quiz.findById(contentId);
      if (quiz) {
        amountToPay = quiz.amountToPay;
        contentType = 'Quiz';
        contentTitle = quiz.title;  // Get the quiz title
      } else {
        // Check for PDF content
        const pdf = await PDF.findById(contentId);
        if (pdf) {
          amountToPay = pdf.amountToPay;
          contentType = 'PDF';
          contentTitle = pdf.title;  // Get the PDF title
        }
      }
    }

    // If content not found, return error
    if (!contentTitle) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Upload the payment image to Cloudinary
    const originalName = path.parse(paymentImage.originalname).name;
    const uploadResult = await cloudinary.uploader.upload(paymentImage.path, {
      folder: 'le chef/E-Wallet Payment',
      public_id: `payment_${userId}_${contentId}_${originalName}`, // Use unique public_id
    });

    // Create the payment record
    const payment = new Payment({
      user: userId,
      amount: parseFloat(amountToPay),
      status: 'pending',
      method: 'Mobile Wallet',  // Assuming it's an e-wallet payment
      contentType,
      contentId,
      paymentImageUrl: uploadResult.secure_url, // Save the image URL from Cloudinary
    });

    await payment.save();

    // Create the notification
    await Notification.create({
      message: `New E-Wallet Payment Request by ${user.username} for ${contentTitle}`,
      type: 'payment',
    });

    // Return success response
    res.json({ message: 'Payment initiated successfully, awaiting approval from teacher', paymentId: payment._id });

  } catch (error) {
    console.error('Payment initiation failed:', error);
    res.status(500).json({ message: 'Payment initiation failed', error: error.message });
  }
};
