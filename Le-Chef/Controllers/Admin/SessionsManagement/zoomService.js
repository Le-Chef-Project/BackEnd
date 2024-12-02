const userModule = require('../../../modules/UsersModule');
const Session = require('../../../modules/SessionsModule'); // Adjust the path as needed
const jwt = require('jsonwebtoken'); // Assuming you're using JWT for tokens
const mongoose = require('mongoose'); // Import mongoose for ObjectId conversion

const axios = require('axios');  // Required to send requests to Zoom API

exports.createZoomMeeting = async (req, res) => {
  const { topic, startTime, duration, level, type } = req.body; // Input from the request

  try {
      // 1. Get access token for Zoom API using OAuth credentials
      const tokenURL = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`;
      const credentials = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64');

      const tokenResponse = await axios.post(tokenURL, {}, {
          headers: {
              Authorization: `Basic ${credentials}`,
          },
      });

      const accessToken = tokenResponse.data.access_token;

      // 2. Create the Zoom meeting by calling Zoom API
      const meetingRequest = {
          topic,
          type, // e.g., Scheduled meeting
          start_time: startTime,
          duration,
          timezone: 'UTC',
          agenda: `Level ${level} Educational Session`, // Specify the level in the agenda
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

      // 3. Return the meeting details
      res.status(201).json({
          meetingUrl: zoomResponse.data.join_url, // URL for participants to join
          meetingId: zoomResponse.data.id,        // Unique Zoom meeting ID
          startTime: zoomResponse.data.start_time, // Start time of the meeting
          agenda: zoomResponse.data.agenda,       // Agenda of the meeting
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
  const userId = req.user._id;   // Assuming user ID is set by auth middleware

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
  