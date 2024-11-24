const express = require('express');
const router=express.Router();
const upload = require('../../uploads/uploads');


const { addStudent } = require('../../Controllers/Admin/UserManagement/StudentManagement'); 
const { getAllStudents } = require('../../Controllers/Admin/UserManagement/StudentManagement');
const { updateStudent } = require('../../Controllers/Admin/UserManagement/StudentManagement');
const { deleteStudent } = require('../../Controllers/Admin/UserManagement/StudentManagement');
const { adminMiddleware } = require('../../Middleware/Admin');
const { authenticateUser } = require('../../Middleware/Auth'); // Adjust the path as necessary
const { editProfile } = require('../../Controllers/Admin/UserManagement/StudentManagement');




router.route('/AddStudents').post( adminMiddleware,addStudent);
router.route('/ShowAllStudents').get(adminMiddleware,getAllStudents);
router.route('/UpdateStudent/:id').put(adminMiddleware,updateStudent);
router.route('/DeleteStudent/:id').delete(adminMiddleware,deleteStudent);
router.put('/editProfile/:userId', adminMiddleware, upload.single('image'), editProfile);





module.exports=router;
