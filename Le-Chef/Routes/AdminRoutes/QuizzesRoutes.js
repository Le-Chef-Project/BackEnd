const express = require('express');
const router=express.Router();

const { AddQuiz } = require('../../Controllers/Admin/ContentManagement/QuizzesController'); 
const { getAllQuizzes } = require('../../Controllers/Admin/ContentManagement/QuizzesController'); 
const { updateQuiz } = require('../../Controllers/Admin/ContentManagement/QuizzesController'); 
const { deleteQuiz } = require('../../Controllers/Admin/ContentManagement/QuizzesController'); 
const { getQuizById } = require('../../Controllers/Admin/ContentManagement/QuizzesController'); 
const { getUnitsWithExams } = require('../../Controllers/Admin/ContentManagement/QuizzesController'); 




const { adminMiddleware } = require('../../Middleware/Admin');









router.route('/AddQuiz').post(adminMiddleware,AddQuiz);
router.route('/ShowAllQuizzes').get(getAllQuizzes);
router.route('/Unit').get(getUnitsWithExams);
router.route('/UpdateQuiz/:id').put(adminMiddleware,updateQuiz);
router.route('/DeleteQuiz/:id').delete(adminMiddleware,deleteQuiz);
router.route('/DeleteQuiz/:id').delete(adminMiddleware,deleteQuiz);
router.route('/:id').get(getQuizById) // Get a Quiz by ID




module.exports=router;
