const DirectChatMessage = require('../../../modules/DirectChatModule');
const cloudinary = require('cloudinary').v2;
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../../../modules/UsersModule');




// SEND DIRECT MESSAGE
exports.sendDirectMessage = async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, 'your_secret_key');
    const senderId = decoded.userId || decoded._id;

    console.log('Decoded token:', decoded);
    console.log('Sender ID:', senderId);

    const { receiverId } = req.params;
    const { content } = req.body;

    console.log('Received files:', req.files);

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(403).json({ message: 'Unauthorized sender' });
    }

    if (sender.role === 'user' && receiver.role === 'user') {
      return res.status(403).json({ message: 'Users cannot message each other' });
    }

    // Handle file uploads
    let imageFile = req.files && req.files.image ? req.files.image : null;
    let documents = req.files && req.files.documents ? req.files.documents : null;
    let audio = req.files && req.files.audio ? req.files.audio : null;

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

    const uploadedImages = imageFile
      ? [await uploadToCloudinary(imageFile, 'LE CHEF/Direct Chat Uploads/Images', 'image')]
      : [];

    const uploadedDocuments = documents
      ? await Promise.all([].concat(documents).map(file => uploadToCloudinary(file, 'LE CHEF/Direct Chat Uploads/Documents', 'raw')))
      : [];

    const uploadedAudio = audio
      ? [await uploadToCloudinary(audio, 'LE CHEF/Direct Chat Uploads/Audios', 'video')]
      : [];

    const newMessage = new DirectChatMessage({
      participants: [senderId, receiverId],
      sender: senderId,
      content,
      images: uploadedImages,
      documents: uploadedDocuments,
      audio: uploadedAudio,
    });

    await newMessage.save();

    const { io } = require('../../../server');
    io.to([senderId, receiverId]).emit('direct message', newMessage);

    res.status(201).json({ message: 'Message sent successfully', newMessage: newMessage.toObject() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
