const Quiz = require('../../../modules/QuizzesModule');
const StudentQuizResult = require('../../../modules/StudentQuizResult');
const mongoose = require('mongoose');

exports.submitQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { answers } = req.body;
        const studentId = req.user._id; // Extract student ID from token

        // Validate quizId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid quiz ID' });
        }

        // Find the quiz
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check if the student has already solved this quiz
        const existingResult = await StudentQuizResult.findOne({
            student: studentId,
            quiz: id,
        });

        if (existingResult) {
            return res.status(400).json({ message: 'Quiz already submitted by this student' });
        }

        // Validate the submission time
       /* const now = new Date();
        if (now < quiz.startAt || now > quiz.endAt) {
            return res.status(400).json({ message: 'Quiz is not currently available' });
        }*/

        // Calculate results
        const totalQuestions = quiz.questions.length;
        let correctAnswers = 0;
        let wrongAnswers = 0;
        let unansweredQuestions = totalQuestions;

        // Convert answers array to a map for easier lookup
        const answerMap = new Map(answers.map(a => [a.questionId.toString(), a.selectedOption]));

        quiz.questions.forEach(question => {
            const selectedOption = answerMap.get(question._id.toString());

            if (selectedOption === undefined) {
                // Unanswered question
                unansweredQuestions -= 1;
            } else if (question.answer === selectedOption) {
                // Correct answer
                correctAnswers += 1;
            } else {
                // Wrong answer
                wrongAnswers += 1;
            }
        });

        // Calculate unansweredQuestions based on totalQuestions and counts
        unansweredQuestions = totalQuestions - (correctAnswers + wrongAnswers);

        // Create and save the student's quiz result
        const studentQuizResult = new StudentQuizResult({
            student: new mongoose.Types.ObjectId(studentId),
            quiz: new mongoose.Types.ObjectId(id),
            answers,
            correctAnswers,
            wrongAnswers,
            totalQuestions,
            unansweredQuestions,
            score: correctAnswers, // Number of correct answers
        });

        await studentQuizResult.save();
        res.status(201).json({
            message: 'Quiz submitted successfully',
            score: `${correctAnswers}/${totalQuestions}`, // Format for response
            correctAnswers,
            wrongAnswers,
            totalQuestions,
            unansweredQuestions,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
