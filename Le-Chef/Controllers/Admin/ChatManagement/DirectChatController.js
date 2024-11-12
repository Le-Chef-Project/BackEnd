const DirectChatMessage = require('../../../modules/DirectChatModule');
const cloudinary = require('cloudinary').v2;
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../../../modules/UsersModule');




const multer = require('multer');
const upload = multer(); // This will handle multipart/form-data requests

exports.sendDirectMessage = async (req, res) => {
  try {
    // Ensure token exists in headers
    const token = req.headers.token;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    // Decode the JWT token to get user ID
    const decoded = jwt.verify(token, 'your_secret_key');
    const senderId = decoded.userId || decoded._id;

    console.log('Decoded token:', decoded);
    console.log('Sender ID:', senderId);

    // Extract receiverId from params and message content from body
    const { receiverId } = req.params;
    const { content } = req.body;

    console.log('Received files:', req.files);  // Log the received files

    // Find the receiver and sender from the database
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(403).json({ message: 'Unauthorized sender' });
    }

    // Prevent users from messaging each other
    if (sender.role === 'user' && receiver.role === 'user') {
      return res.status(403).json({ message: 'Users cannot message each other' });
    }

    // Handling the files (images, documents, audio)
    let imageFile = req.files && req.files.image ? req.files.image : null;
    let documents = req.files && req.files.documents ? req.files.documents : null;
    let audio = req.files && req.files.audio ? req.files.audio : null;

    console.log('Received files:', req.files);  // This should show the files in the request

    // Function to upload file to Cloudinary
    const uploadToCloudinary = (file, folder, resourceType = 'image') => {
      return new Promise((resolve, reject) => {
        if (!file || !file.data) {
          return reject(new Error('File data is undefined'));
        }
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: resourceType },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        stream.end(file.data);
      });
    };

    // Uploading image files if present
    const uploadedImages = imageFile
      ? [await uploadToCloudinary(imageFile, 'LE CHEF/Direct Chat Uploads/Images', 'image')]
      : [];

    // Uploading documents if present
    const uploadedDocuments = documents
      ? await Promise.all([].concat(documents).map(file => uploadToCloudinary(file, 'LE CHEF/Direct Chat Uploads/Documents', 'raw')))
      : [];

    // Uploading audio files if present
    const uploadedAudio = audio
      ? [await uploadToCloudinary(audio, 'LE CHEF/Direct Chat Uploads/Audios', 'video')]
      : [];

    // Create a new message
    const newMessage = new DirectChatMessage({
      participants: [senderId, receiverId],
      sender: senderId,
      content,
      images: uploadedImages,
      documents: uploadedDocuments,
      audio: uploadedAudio,
    });

    // Save the message to the database
    await newMessage.save();

    // Emit the new message to the sender and receiver via WebSocket (assuming socket.io is used)
    const { io } = require('../../../server');  // Adjust path as necessary
    io.to([senderId, receiverId]).emit('direct message', newMessage);

    // Respond with a success message
    res.status(201).json({ message: 'Message sent successfully', newMessage: newMessage.toObject() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};