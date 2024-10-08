// Import Socket.IO
const { io } = require('../server');

// Function to emit messages to connected clients
function emitMessage(text, sender, date) {
    io.emit('chat message', { text, sender, date });
}

module.exports = { emitMessage };


