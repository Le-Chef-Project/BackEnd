const Quiz = require('../../../modules/QuizzesModule');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // Assuming you're using JWT for tokens

exports.AddQuiz = async (req, res) => {
    try {
        const { title, questions, hours, minutes } = req.body;

        // Extract the token from the request headers
        const token = req.headers.token
        const decoded = jwt.verify(token, 'your_secret_key'); // Replace with your actual secret key
        const teacherId = decoded._id; // Assuming '_id' contains the teacher's ID

        // Construct the quiz object with hours, minutes, and teacher's ID from the token
        const quiz = new Quiz({
            title,
            questions: questions.map(q => ({
                question: q.question,
                options: q.options,
                answer: q.answer
            })),
            teacher: teacherId, // Use the teacher's existing ID from the token
            duration: {
                hours: parseInt(hours),
                minutes: parseInt(minutes),
            },
        });

        await quiz.save();
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
        const { title, questions, teacher, duration, startAt, endAt } = req.body;
        const updatedQuiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            {
                title,
                questions,
                teacher: new mongoose.Types.ObjectId(teacher),
                duration,
                startAt,
                endAt,
                updatedAt: Date.now()
            },
            { new: true } // Return the updated document
        );

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
