const express = require('express');
const router=express.Router();
const upload = require('../../uploads/uploads');
const { AddNote } = require('../../Controllers/Admin/Content/NotesController'); 
const { getAllNotes } = require('../../Controllers/Admin/Content/NotesController');
const { updateNote } = require('../../Controllers/Admin/Content/NotesController'); 
const { deleteNote } = require('../../Controllers/Admin/Content/NotesController'); 



const { createPDF } = require('../../Controllers/Admin/Content/PdfController'); 
const { getAllPDFs } = require('../../Controllers/Admin/Content/PdfController'); 
const { deletePDF } = require('../../Controllers/Admin/Content/PdfController'); 
const { adminMiddleware } = require('../../Middleware/Admin');


const {UploadVideo, getAllVideos, getVideoById, updateVideo, deleteVideo } = require('../../Controllers/Admin/Content/VideoConroller'); 


router.route('/Notes').post(adminMiddleware,AddNote);
router.route('/ShowAllNotes').get(getAllNotes);
router.route('/UpdateNotes/:id').put(adminMiddleware,updateNote);
router.route('/DeleteNotes/:id').delete(adminMiddleware,deleteNote);



router.route('/Pdfs').post(upload.single('pdf'),adminMiddleware,createPDF);
router.route('/ShowAllPdfs').get(getAllPDFs);
router.route('/DeletePdf/:id').delete(adminMiddleware,deletePDF);

// Define routes
router.route('/videos').get(getAllVideos) // Get all videos
 .post(upload.single('video'),adminMiddleware, UploadVideo); // Upload a new video

router.route('/videos/:id').get(getVideoById) // Get a video by ID
    .put(adminMiddleware,updateVideo) // Update a video by ID
    .delete(adminMiddleware,deleteVideo); // Delete a video by ID


module.exports=router;
