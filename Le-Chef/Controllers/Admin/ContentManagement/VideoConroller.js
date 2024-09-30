const mongoose = require('mongoose');
const cloudinary = require('../../../Util/Cloudinary');
const path = require('path'); // Import path module
const Video = require('../../../modules/VideosModule'); // Adjust the path to your Video model


// Create a new video document
exports.UploadVideo = async (req, res) => {
    try {
        const { title, description, teacher } = req.body;
        const file = req.file; // Get the uploaded file

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Extract the original filename without extension
        const originalName = path.parse(file.originalname).name;

        // Upload the video to Cloudinary with the original filename
        const uploadResult = await cloudinary.uploader.upload(file.path, {
            resource_type: 'video',
            folder: 'le chef/videos',
            public_id: originalName, // Set the public_id to retain the original filename
            upload_preset: 'ml_default', // Optional: Use if you have upload presets
        });

        // Create a new video document with the URL returned by Cloudinary
        const teacherId = mongoose.Types.ObjectId.isValid(teacher) ? new mongoose.Types.ObjectId(teacher) : teacher;
        const newVideo = new Video({
            title,
            description,
            url: uploadResult.secure_url, // Use the Cloudinary URL for the video
            teacher: teacherId,
        });

        // Save the video document to the database
        const savedVideo = await newVideo.save();
        res.status(201).json(savedVideo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Get all videos
exports.getAllVideos = async (req, res) => {
    try {
        const videos = await Video.find(); // Retrieve all video documents
        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a video by ID
exports.getVideoById = async (req, res) => {
    try {
        const { id } = req.params;
        const video = await Video.findById(id); // Find the video by ID

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.status(200).json(video);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a video by ID
exports.updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, teacher, url } = req.body;

        // Log incoming data for debugging
        console.log('Update Request:', { id, title, description, teacher, url });

        // Update the video document
        const updatedVideo = await Video.findByIdAndUpdate(id, {
            title,
            description,
            teacher,
            url
        }, { new: true, runValidators: true }); // Return the updated document and validate

        if (!updatedVideo) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.status(200).json(updatedVideo);
    } catch (error) {
        console.error('Update Error:', error.message); // Log the error message for debugging
        res.status(500).json({ error: error.message });
    }
};


// Delete a video by ID
exports.deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the video document
        const deletedVideo = await Video.findByIdAndDelete(id);

        if (!deletedVideo) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
