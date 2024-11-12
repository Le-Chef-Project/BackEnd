
const Group = require('../../../modules/GroupModule');
const GroupChatMessage = require('../../../modules/GroupChatModule');
const cloudinary = require('cloudinary').v2;
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../../../modules/UsersModule');
const multer = require('multer');
const path = require('path');
const upload = multer(); // Set up multer for handling multipart form-data

exports.sendGroupMessage = [
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'documents', maxCount: 10 },
    { name: 'audio', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const token = req.headers.token;
      if (!token) return res.status(401).json({ message: 'No token provided' });

      const decoded = jwt.verify(token, 'your_secret_key');
      const senderId = decoded.userId || decoded._id;

      const { groupId } = req.params;
      const { content } = req.body;

      const sender = await User.findById(senderId);
      if (!sender) return res.status(403).json({ message: 'Unauthorized sender' });

      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      if (!group.members.includes(senderId)) {
        return res.status(403).json({ message: 'You are not a member of this group' });
      }

      const images = req.files.images || [];
      const documents = req.files.documents || [];
      const audio = req.files.audio ? req.files.audio[0] : null;

      const uploadToCloudinary = (file, folder, resourceType = 'image') => {
        return new Promise((resolve, reject) => {
          if (!file || !file.buffer) {
            return reject(new Error('File data is undefined'));
          }
          const originalName = file.originalname.split('.')[0];
          const stream = cloudinary.uploader.upload_stream(
            { folder, public_id: originalName, resource_type: resourceType },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        });
      };

      const uploadedImages = await Promise.all(images.map(file =>
        uploadToCloudinary(file, 'LE CHEF/Chat Uploads/Images', 'image')
      ));

      const uploadedDocuments = await Promise.all(documents.map(file =>
        uploadToCloudinary(file, 'LE CHEF/Chat Uploads/Documents', 'raw')
      ));

      const uploadedAudio = audio ? await uploadToCloudinary(audio, 'LE CHEF/Chat Uploads/Audios', 'video') : null;

      let conversation = await GroupChatMessage.findOne({ group: groupId });
      const newMessage = {
        sender: senderId,
        content,
        images: uploadedImages,
        documents: uploadedDocuments,
        audio: uploadedAudio ? [uploadedAudio] : [],
        createdAt: Date.now(),
      };

      if (conversation) {
        conversation.messages.push(newMessage);
      } else {
        conversation = new GroupChatMessage({
          group: groupId,
          messages: [newMessage],
        });
      }


      await conversation.save();

      console.log('Content:', content);
      console.log('Sender:', senderId);


      const { io } = require('../../../server');
      io.to(`group_${groupId}`).emit('group message', conversation);

      res.status(201).json({ message: 'Message sent successfully', conversation: conversation.toObject() });
    } catch (error) {
      console.error('Error in sendGroupMessage:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  
];


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