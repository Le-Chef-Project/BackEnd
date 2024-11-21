const express = require('express');
const router=express.Router();
const { generateRtcToken } = require('../../Controllers/Admin/SessionsManagement/SessionsController'); 
const { createSession } = require('../../Controllers/Admin/SessionsManagement/SessionsController'); 
const { getSessions } = require('../../Controllers/Admin/SessionsManagement/SessionsController'); 

router.post('/RTC', generateRtcToken);
router.post('/CreateSession', createSession);
router.get('/GetSession', getSessions);






module.exports=router;