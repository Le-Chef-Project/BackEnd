const dotenv = require('dotenv');
dotenv.config(); // Load environment variables first
const express = require('express');
const dbConnection = require('./Config/database');
const morgan = require('morgan');
const cloudinary = require('./Util/Cloudinary');
const users = require('./modules/UsersModule')
const payment = require('./modules/PaymentModule')
const chats = require('./modules/ChatsModule')
const group = require('./modules/GroupModule')
const pdf = require('./modules/PdfModule')
const quizzes = require('./modules/QuizzesModule')
const sessions = require('./modules/SessionsModule')
const videos = require('./modules/VideosModule')
const notes = require('./modules/NotesModule')
const noteroute = require('./Routes/AdminRoutes/ContentRoutes');
const pdfroute = require('./Routes/AdminRoutes/ContentRoutes');
const videoroute = require('./Routes/AdminRoutes/ContentRoutes');
const StudentManageRoutes = require('./Routes/AdminRoutes/StudentManageRoutes');
const loginroute = require('./Routes/UserRoutes/loginRoutes');






// Connect to the database
dbConnection();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests


// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`Mode: ${process.env.NODE_ENV}`);
}

// Routes
app.use('/content', noteroute, pdfroute,videoroute);
app.use('/userManage', StudentManageRoutes);
app.use('/Users', loginroute);


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
