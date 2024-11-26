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
  const { title, description, date, startTime, endTime, educationLevel } = req.body;
  const token = req.headers.token;

  try {
      // Verify the token to get teacher's ID
      const decoded = jwt.verify(token, 'your_secret_key'); // Replace 'your_secret_key' with your actual secret
      const teacherId = decoded._id;

      // Convert startTime and endTime to valid Date objects
      const startDate = new Date(`${date}T${startTime}:00`);
      const endDate = new Date(`${date}T${endTime}:00`);

      // Fetch users with the selected education level
      const participants = await userModule.find({
          educationLevel: educationLevel,
          _id: { $ne: teacherId }, // Exclude the teacher from the participants list
      }).select('_id'); // Only fetch the IDs

      // Map participant IDs for the session
      const participantIds = participants.map((user) => user._id);

      // Create the session with the teacher as the host and participants as filtered users
      const session = await Session.create({
          title,
          description,
          date,
          startTime: startDate,
          endTime: endDate,
          hostUrl: `${req.protocol}://${req.get('host')}/session/${title}`,
          teacher: teacherId,
          participants: [teacherId, ...participantIds], // Add teacher and participants
      });

      res.status(201).json({
          message: 'Session created successfully',
          session,
      });
  } catch (err) {
      console.error('Error creating session:', err);
      res.status(500).json({ error: 'Error creating session', details: err.message });
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
  
  