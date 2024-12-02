const express = require('express');
const router=express.Router();
const { adminMiddleware } = require('../../Middleware/Admin');
const { userMiddleware } = require('../../Middleware/User');

const { generateRtcToken } = require('../../Controllers/Admin/SessionsManagement/SessionsController'); 
const { createSession } = require('../../Controllers/Admin/SessionsManagement/SessionsController'); 
const { getSessions } = require('../../Controllers/Admin/SessionsManagement/SessionsController'); 



const { createZoomMeeting } = require('../../Controllers/Admin/SessionsManagement/zoomService'); 
const { joinZoomMeeting } = require('../../Controllers/Admin/SessionsManagement/zoomService'); 


router.post('/RTC', generateRtcToken);
router.post('/CreateSession', createSession);
router.get('/GetSession', getSessions);





router.post('/create-zoom-meeting', adminMiddleware,createZoomMeeting);

router.post('/join-zoom-meeting', userMiddleware,joinZoomMeeting);







module.exports=router;