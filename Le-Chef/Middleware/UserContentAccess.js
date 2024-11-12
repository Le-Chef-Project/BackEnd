const Video = require('../modules/VideosModule'); // Adjust the path to your Video model

exports.ContentAccess = (contentType) => {
    return async (req, res, next) => {
        const user = req.user; // User should be set in the previous middleware
        const contentId = req.params.id; // Assuming contentId is passed as a route parameter

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: No user found' });
        }

        // Fetch the video from the database (assuming you have a Video model)
        const video = await Video.findById(contentId);
        if (!video) {
            return res.status(404).json({ message: 'Not Found: Video does not exist' });
        }

        console.log('Video:', video); // Log the video details

        // Check if the video is free (not paid) or if the user has purchased it
        const hasAccess = !video.paid || user.paidContent.some(
            (content) => 
                content.contentId.toString() === contentId && 
                content.contentType === contentType
        );

        // Additionally check if the video is locked when it is paid
        if (video.isLocked && video.paid && !hasAccess) {
            return res.status(403).json({ message: 'This video is locked. You should pay Lesson fees' });
        }

        console.log('Access Check Result:', hasAccess); // Log whether access is granted

        if (!hasAccess) {
            return res.status(403).json({ message: 'This video is locked. You should pay Lesson fees' });
        }

        next();
    };
};
