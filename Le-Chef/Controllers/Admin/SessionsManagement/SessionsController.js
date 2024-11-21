const userModule = require('../../../modules/UsersModule');
const Session = require('../../../modules/SessionsModule'); // Adjust the path as needed
const jwt = require('jsonwebtoken'); // Assuming you're using JWT for tokens
const mongoose = require('mongoose'); // Import mongoose for ObjectId conversion

const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

exports.generateRtcToken = (req, res) => {
  const appId = process.env.AGORA_APP_ID; // Your Agora App ID
  const appCertificate = process.env.AGORA_APP_CERTIFICATE; // Your Agora App Certificate
  const channelName = req.body.channelName; // The channel name for the session
  const uid = req.body.uid || 0; // User ID (0 for auto-assigned by Agora)
  const role = req.body.role || RtcRole.PUBLISHER; // Host or audience
  const expirationTimeInSeconds = 3600; // Token validity (e.g., 1 hour)
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTimestamp + expirationTimeInSeconds;

  // Generate the token
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );

  res.json({ token });
};

exports.createSession = async (req, res) => {
    const { title, description, date, startTime, endTime } = req.body; // No participants in body
    const token = req.headers.token;
    
    try {
        const decoded = jwt.verify(token, 'your_secret_key'); // Replace with your actual secret key
        const teacherId = decoded._id; // Assuming '_id' contains the teacher's ID
  
        // Convert startTime and endTime to valid Date objects
        const startDate = new Date(`${date}T${startTime}:00`);
        const endDate = new Date(`${date}T${endTime}:00`);
  
        // Create the session with the teacher as the first member in the participants array
        const session = await Session.create({
            title,
            description,
            date,
            startTime: startDate, // Pass the Date object
            endTime: endDate,     // Pass the Date object
            hostUrl: `${req.protocol}://${req.get('host')}/session/${title}`,
            teacher: teacherId,   // Pass teacher ID as ObjectId in the teacher field
            participants: [teacherId],    // Add teacher as the first participant
        });
  
        res.status(201).json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

  

  exports.getSessions = async (req, res) => {
    try {
      // Get the current time
      const currentTime = new Date();
  
      // Find sessions that are active (current time is between start and end time)
      const activeSessions = await Session.find({
        startTime: { $lte: currentTime }, // start time is in the past or present
        endTime: { $gte: currentTime }    // end time is in the future or present
      });
  
      // Return the active sessions
      res.json(activeSessions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  