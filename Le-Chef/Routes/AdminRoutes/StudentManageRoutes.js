const express = require('express');
const router=express.Router();

const { addStudent } = require('../../Controllers/Admin/UserMangement/StudentMangement'); 
const { getAllStudents } = require('../../Controllers/Admin/UserMangement/StudentMangement');
const { updateStudent } = require('../../Controllers/Admin/UserMangement/StudentMangement');
const { deleteStudent } = require('../../Controllers/Admin/UserMangement/StudentMangement');
const { adminMiddleware } = require('../../Middleware/Admin');
const { authenticateUser } = require('../../Middleware/Auth'); // Adjust the path as necessary




router.route('/AddStudents').post( adminMiddleware,addStudent);
router.route('/ShowAllStudents').get(adminMiddleware,getAllStudents);
router.route('/UpdateStudent/:id').put(adminMiddleware,updateStudent);
router.route('/DeleteStudent/:id').delete(adminMiddleware,deleteStudent);







module.exports=router;
