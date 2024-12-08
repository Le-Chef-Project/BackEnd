const Quiz = require('../../../modules/QuizzesModule');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // Assuming you're using JWT for tokens
const Notification = require('../../../modules/NotificationsModule'); 

exports.AddQuiz = async (req, res) => {
    try {
        const { title, questions, hours, minutes, amountToPay, paid, educationLevel, Unit } = req.body;
        const token = req.headers.token;
        const decoded = jwt.verify(token, 'your_secret_key');  // Replace with your actual secret key
        const teacherId = decoded._id;  // Assuming '_id' contains the teacher's ID

        // Create the quiz
        const quiz = new Quiz({
            title,
            questions: questions.map(q => ({
                question: q.question,
                options: q.options,
                answer: q.answer
            })),
            teacher: teacherId,
            duration: {
                hours: parseInt(hours),
                minutes: parseInt(minutes),
            },
            amountToPay: paid ? parseFloat(amountToPay) : undefined,
            paid: paid,
            educationLevel: parseInt(educationLevel),
            Unit: parseInt(Unit),
        });

        await quiz.save();

        // Create the notification
        await Notification.create({
            message: `You have a new quiz: ${quiz.title}!`,  // Include the quiz title in the message
            type: 'quiz',
            level:educationLevel
        });

        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};







exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate('teacher', 'username email');
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};




exports.updateQuiz = async (req, res) => {
    try {
        const updateData = {};
        
        // Only add fields to updateData if they are provided in the request body
        if (req.body.title) updateData.title = req.body.title;
        if (req.body.questions) {
            updateData.questions = Array.isArray(req.body.questions) 
                ? req.body.questions.map(q => ({
                    question: q.question,
                    options: q.options,
                    answer: q.answer
                }))
                : [];
        }
        if (req.body.teacher) updateData.teacher = new mongoose.Types.ObjectId(req.body.teacher);
        if (req.body.hours) updateData.duration = { hours: parseInt(req.body.hours) };
        if (req.body.minutes) updateData.duration = { ...updateData.duration, minutes: parseInt(req.body.minutes) };
        if (req.body.amountToPay) updateData.amountToPay = parseFloat(req.body.amountToPay);
        if (req.body.paid !== undefined) updateData.paid = req.body.paid;
        if (req.body.educationLevel) updateData.educationLevel = parseInt(req.body.educationLevel);
        if (req.body.Unit) updateData.Unit = parseInt(req.body.Unit);
        updateData.updatedAt = Date.now();

        const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!updatedQuiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        res.status(200).json(updatedQuiz);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};




exports.deleteQuiz = async (req, res) => {
    try {
        const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!deletedQuiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('teacher', 'username email');
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.status(200).json(quiz);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};





exports.getUnitsWithExams = async (req, res) => {
    try {
        // Find all distinct units that have at least one exam
        const unitsWithExams = await Quiz.distinct("Unit");

        // Map the units to the desired format if needed
        const unitNames = unitsWithExams.map(unit => `Unit ${unit}`);

        // Respond with the unit names
        res.status(200).json({ units: unitNames });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


