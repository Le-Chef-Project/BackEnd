
const Group = require('../../../modules/GroupModule');
const GroupChatMessage = require('../../../modules/GroupChatModule');
const cloudinary = require('cloudinary').v2;
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../../../modules/UsersModule');
const multer = require('multer');

// SEND GROUP MESSAGES
exports.sendGroupMessage = async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, 'your_secret_key');
    const senderId = decoded._id;
    const { groupId } = req.params;
    const { content } = req.body;

    let images = req.files && req.files.images ? req.files.images : null;
    let documents = req.files && req.files.documents ? req.files.documents : null;
    let audio = req.files && req.files.audio ? req.files.audio : null;

    // Ensure audio is an array if multiple files are sent
    if (Array.isArray(audio)) {
      audio = audio[0]; // Access the first file if it's an array
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(senderId)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

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

    const uploadedImages = images
      ? await Promise.all([].concat(images).map(file => uploadToCloudinary(file, 'LE CHEF/Chat Uploads/Images', 'image')))
      : [];

    const uploadedDocuments = documents
      ? await Promise.all([].concat(documents).map(file => uploadToCloudinary(file, 'LE CHEF/Chat Uploads/Documents', 'raw')))
      : [];

    const uploadedAudio = audio 
      ? [await uploadToCloudinary(audio, 'LE CHEF/Chat Uploads/Audios', 'video')] 
      : [];

    const newMessage = new GroupChatMessage({
      group: groupId,
      sender: senderId,
      content,
      images: uploadedImages,
      documents: uploadedDocuments,
      audio: uploadedAudio,
    });


    await newMessage.save();

    const { io } = require('../../../server');
    io.to(`group_${groupId}`).emit('group message', newMessage);

    res.status(201).json({ message: 'Message sent successfully', newMessage: newMessage.toObject() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


/*
exports.sendDirectMessage = async (req, res) => {
  try {
    // Extract and verify token
    const token = req.headers.token;
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    const decoded = jwt.verify(token, 'your_secret_key');
    const senderId = decoded.userId;

    const { receiverId, content, images, documents, audio } = req.body;

    // Ensure that either sender or receiver is admin
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!sender || !receiver) {
      return res.status(404).json({ message: 'Sender or Receiver not found' });
    }

    if (sender.role !== 'admin' && receiver.role !== 'admin') {
      return res.status(403).json({ message: 'Direct messages only allowed between admin and students' });
    }

    // Participants array should have admin and student
    const participants = [senderId, receiverId].sort(); // Sorting to maintain consistency

    // Create new direct message
    const newDirectMessage = new DirectChatMessage({
      participants,
      sender: senderId,
      content,
      images,
      documents,
      audio,
    });

    await newDirectMessage.save();

    // Emit the message via Socket.IO
    const { io } = require('../server'); // Adjust the path as necessary
    const roomName = `direct_${participants.join('_')}`; // Unique room for the two participants
    io.to(roomName).emit('direct message', newDirectMessage);

    res.status(201).json({ message: 'Direct message sent successfully', newDirectMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
*/






/*
  exports.getDirectMessages = async (req, res) => {
    try {
      const token = req.headers.token;
      if (!token) return res.status(401).json({ message: 'No token provided' });
      
      const decoded = jwt.verify(token, 'your_secret_key');
      const userId = decoded.userId;
  
      const { receiverId } = req.params;
  
      // Ensure that one of the participants is admin
      const receiver = await User.findById(receiverId);
      const sender = await User.findById(userId);
      if (!receiver || !sender) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (sender.role !== 'admin' && receiver.role !== 'admin') {
        return res.status(403).json({ message: 'Direct messages only allowed between admin and students' });
      }
  
      const participants = [userId, receiverId].sort();
  
      const messages = await DirectChatMessage.find({
        participants: participants,
      }).sort({ createdAt: 1 });
  
      res.status(200).json({ messages });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };*/


//routes
/*
  router.post('/send', authenticate, directMessageController.sendDirectMessage);
router.get('/messages/:receiverId', authenticate, directMessageController.getDirectMessages);*/

//MISSSSEDDDDD::::getallmessages in the group