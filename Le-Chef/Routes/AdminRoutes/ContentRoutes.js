const express = require('express');
const router=express.Router();
const upload = require('../../uploads/uploads');
const { AddNote } = require('../../Controllers/Admin/ContentManagement/NotesController'); 
const { getAllNotes } = require('../../Controllers/Admin/ContentManagement/NotesController');
const { updateNote } = require('../../Controllers/Admin/ContentManagement/NotesController'); 
const { deleteNote } = require('../../Controllers/Admin/ContentManagement/NotesController'); 
const { getAllNotesForUserLevel } = require('../../Controllers/Admin/ContentManagement/NotesController');
const { userMiddleware } = require('../../Middleware/User');
const { ContentAccess } = require('../../Middleware/UserContentAccess');





const { createPDF } = require('../../Controllers/Admin/ContentManagement/PdfController'); 
const { getAllPDFs } = require('../../Controllers/Admin/ContentManagement/PdfController'); 
const { deletePDF } = require('../../Controllers/Admin/ContentManagement/PdfController'); 
const { adminMiddleware } = require('../../Middleware/Admin');



const {UploadVideo, getAllVideos, getVideoById, updateVideo, deleteVideo } = require('../../Controllers/Admin/ContentManagement/VideoConroller'); 


router.route('/Notes').post(adminMiddleware,AddNote);
router.route('/ShowAllNotes').get(getAllNotes);
router.route('/UpdateNotes/:id').put(adminMiddleware,updateNote);
router.route('/DeleteNotes/:id').delete(adminMiddleware,deleteNote);
router.route('/ShowLevelNotes').get(userMiddleware,getAllNotesForUserLevel);



router.route('/Pdfs').post(upload.single('pdf'),adminMiddleware,createPDF);
router.route('/ShowAllPdfs').get(getAllPDFs);
router.route('/DeletePdf/:id').delete(adminMiddleware,deletePDF);

// Define routes
router.route('/videos').get(getAllVideos) // Get all videos
 .post(upload.single('video'),adminMiddleware, UploadVideo); // Upload a new video

 router.route('/videos/:id')
 .get(userMiddleware,ContentAccess('Video'), getVideoById) // Get a video by ID with access control
 .put(adminMiddleware, updateVideo) // Update a video by ID
 .delete(adminMiddleware, deleteVideo); // Delete a video by 

module.exports=router;
