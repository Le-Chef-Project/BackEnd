const Quiz = require('../../../modules/QuizzesModule');
const mongoose = require('mongoose');

exports.AddQuiz = async (req, res) => {
    try {
        const { title, questions, teacher, duration, startAt, endAt } = req.body;

        // Convert startAt and endAt to full date objects for the availability window
        const startDate = new Date(startAt); // Exam start date (availability window start)
        const endDate = new Date(endAt); // Exam end date (availability window end)

        // Construct the quiz object with availability window and duration for students
        const quiz = new Quiz({
            title,
            questions: questions.map(q => ({
                question: q.question,
                options: q.options,
                answer: q.answer
            })),
            teacher: new mongoose.Types.ObjectId(teacher),
            duration, // Time limit for students once they begin the exam
            startAt: startDate,  // Exam availability window start
            endAt: endDate // Exam availability window end
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
