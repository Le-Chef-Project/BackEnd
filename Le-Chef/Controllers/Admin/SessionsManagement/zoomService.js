const userModule = require('../../../modules/UsersModule');
const Session = require('../../../modules/SessionsModule'); // Adjust the path as needed
const jwt = require('jsonwebtoken'); // Assuming you're using JWT for tokens
const mongoose = require('mongoose'); // Import mongoose for ObjectId conversion
const moment = require('moment-timezone'); 

const axios = require('axios');  // Required to send requests to Zoom API

exports.createZoomMeeting = async (req, res) => {
  const { title, description, level } = req.body; // Removed startTime and type from input

  try {
    // Extract teacher ID from the token payload (assumes req.user is populated by auth middleware)
    const teacherId = req.user._id;

    // 1. Get access token for Zoom API using OAuth credentials
    const tokenURL = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`;
    const credentials = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64');

    const tokenResponse = await axios.post(tokenURL, {}, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // 2. Create the Zoom meeting by calling the Zoom API
    const meetingRequest = {
      title,
      type: 1, // Instant meeting type
      timezone: 'Africa/Cairo', // Informational, not used for calculations
      agenda: `Level ${level} Educational Session`,
    };

    const zoomResponse = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      meetingRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const currentDateTime = moment().tz('Africa/Cairo'); // Use current time as start time

    // 3. Save session details to the database
    const newSession = new Session({
      title,
      description,
      date: currentDateTime.toDate(),
      hostUrl: zoomResponse.data.start_url,
      joinUrl: zoomResponse.data.join_url,
      zoomMeetingId: zoomResponse.data.id,
      teacher: teacherId,
    });

    await newSession.save();

    // 4. Return the meeting details to the client
    res.status(201).json({
      message: 'Meeting created successfully',
      session: newSession,
    });
  } catch (error) {
    if (error.response) {
      console.error('Zoom API Error:', error.response.data);
      res.status(500).json({ error: error.response.data.message || 'Failed to create Zoom meeting' });
    } else {
      console.error('Unknown error:', error.message);
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};



// Controller function to join a Zoom meeting
exports.joinZoomMeeting = async (req, res) => {
  const { meetingId } = req.body; // Extract meeting ID from the request body
  const userId = req.user._id;    // Assuming user ID is set by auth middleware

  try {
      // Fetch the user's education level from the database
      const user = await userModule.findById(userId).select('educationLevel');
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      const studentLevel = user.educationLevel;

      // Get access token for Zoom API
      const tokenURL = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`;
      const credentials = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64');

      const tokenResponse = await axios.post(tokenURL, {}, {
          headers: {
              Authorization: `Basic ${credentials}`,
          },
      });

      const accessToken = tokenResponse.data.access_token;

      // Fetch the meeting details from Zoom API
      const meetingDetailsResponse = await axios.get(
          `https://api.zoom.us/v2/meetings/${meetingId}`,
          {
              headers: {
                  Authorization: `Bearer ${accessToken}`,
              },
          }
      );

      const meetingDetails = meetingDetailsResponse.data;

      // Extract and validate the meeting's level (e.g., from the agenda)
      const meetingLevel = parseInt(meetingDetails.agenda.split(' ')[1], 10); // Adjust based on your agenda format
      if (studentLevel === meetingLevel) {
          // Add user to the meeting's participants list in the database
          const session = await Session.findOneAndUpdate(
              { zoomMeetingId: meetingId }, // Match the session using Zoom meeting ID
              { $addToSet: { participants: userId } }, // Add user to participants if not already present
              { new: true } // Return the updated session document
          );

          if (!session) {
              return res.status(404).json({ error: 'Meeting not found' });
          }

          // Return the join URL for the student
          res.status(200).json({
              joinUrl: meetingDetails.join_url,
          });
      } else {
          res.status(403).json({ error: 'You are not eligible to join this meeting' });
      }
  } catch (error) {
      console.error('Error joining Zoom meeting:', error);
      res.status(500).json({ error: 'Failed to join Zoom meeting' });
  }
};
  