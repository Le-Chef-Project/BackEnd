const userModule = require('../../../modules/UsersModule');
const Session = require('../../../modules/SessionsModule'); // Adjust the path as needed
const jwt = require('jsonwebtoken'); // Assuming you're using JWT for tokens
const mongoose = require('mongoose'); // Import mongoose for ObjectId conversion

const axios = require('axios');  // Required to send requests to Zoom API

// Controller function to create a Zoom meeting
exports.createZoomMeeting = async (req, res) => {
  const { topic, startTime, duration, level, type } = req.body;  // Extract input data from the request

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
      type,  // Scheduled meeting
      start_time: startTime,
      duration,
      timezone: 'UTC',
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

    // 3. Send the meeting details (including join URL) back to the client
    res.status(201).json({
      meetingUrl: zoomResponse.data.join_url,  // Join URL to allow students to join the meeting
      meetingId: zoomResponse.data.id,
    });

  } catch (error) {
    if (error.response) {
        // Zoom returns error details in response.data
        console.error('Zoom API Error:', error.response.data);
      } else {
        console.error('Unknown error:', error.message);
      }
  }
 
   
  }




// Controller function to join a Zoom meeting
exports. joinZoomMeeting = async (req, res) => {
    const { meetingId, studentLevel } = req.body;  // Extract meeting ID and student level
  
    try {
      // 1. Get access token for Zoom API (same process as in the create function)
      const tokenURL = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`;
      const credentials = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64');
  
      const tokenResponse = await axios.post(tokenURL, {}, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });
  
      const accessToken = tokenResponse.data.access_token;
  
      // 2. Fetch the meeting details from Zoom API
      const meetingDetailsResponse = await axios.get(
        `https://api.zoom.us/v2/meetings/${meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      const meetingDetails = meetingDetailsResponse.data;
  
      // 3. Check if the student's level matches the meeting level (this logic would need to be implemented)
      if (studentLevel === meetingDetails.agenda.split(' ')[1]) {  // Assuming agenda contains level info
        // 4. Return the join URL for the student to join the meeting
        res.status(200).json({
          joinUrl: meetingDetails.join_url,  // Provide the Zoom join URL
        });
      } else {
        res.status(403).json({ error: 'You are not eligible to join this meeting' });
      }
  
    } catch (error) {
      console.error('Error joining Zoom meeting:', error);
      res.status(500).json({ error: 'Failed to join Zoom meeting' });
    }
  };
  