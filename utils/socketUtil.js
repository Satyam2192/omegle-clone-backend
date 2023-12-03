// /backend/utils/socketUtil.js

const { saveChatMessage, trackUser, removeUser, getConnectedUsers, connectRandomUsers } = require('../controllers/chatController');

const socketUtil = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected');

    const userId = trackUser(socket.id);
    io.emit('connectedUsers', getConnectedUsers());

    // Connect random users when someone joins
    connectRandomUsers(io, socket);

    socket.on('disconnect', () => {
      console.log('User disconnected');
      removeUser(userId);

      // If a user disconnects, check if there's another user in the waiting list
      connectRandomUsers(io, socket);
      io.emit('connectedUsers', getConnectedUsers());
    });

    socket.on('message', (message) => {
      saveChatMessage(message);
      io.emit('message', { userId, message });
    });

    socket.on('skip', (currentUserId) => {
      removeUser(currentUserId);
      io.emit('connectedUsers', getConnectedUsers());
    });

    // Handle video call signaling
    socket.on('offer', (offer, targetUserId) => {
      io.to(targetUserId).emit('offer', offer, userId);
    });

    socket.on('answer', (answer, targetUserId) => {
      io.to(targetUserId).emit('answer', answer, userId);
    });

    socket.on('ice-candidate', (candidate, targetUserId) => {
      io.to(targetUserId).emit('ice-candidate', candidate, userId);
    });
  });
};

module.exports = socketUtil;

