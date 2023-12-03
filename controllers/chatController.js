const Chat = require('../models/chatModel');

let connectedUsers = new Map();

const generateUserId = () => {
  // Implement your own logic to generate a unique user ID
  return Math.random().toString(36).substring(7);
};

const trackUser = (socketId) => {
  const userId = generateUserId();
  connectedUsers.set(socketId, userId);
  return userId;
};

const removeUser = (userId) => {
  connectedUsers = new Map([...connectedUsers].filter(([_, id]) => id !== userId));
};

const getChatHistory = async (req, res) => {
  try {
    const chatHistory = await Chat.find().sort({ createdAt: -1 }).limit(10);
    res.json(chatHistory);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const saveChatMessage = async (message) => {
  try {
    const chatMessage = new Chat({ message });
    await chatMessage.save();
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
};

const getConnectedUsers = () => {
  return Array.from(connectedUsers.values());
};

// Track users waiting for a partner
let waitingUsers = [];


// Function to get a random user from the waiting list
const getRandomUser = () => {
  return waitingUsers[Math.floor(Math.random() * waitingUsers.length)];
};

// Connect random users
const connectRandomUsers = (io, socket) => {
  if (waitingUsers.length > 1) {
    const partnerSocketId = getRandomUser();
    const index = waitingUsers.indexOf(partnerSocketId);
    waitingUsers.splice(index, 1); // Remove partner from waiting list

    const currentUserId = connectedUsers.get(socket.id);
    const partnerUserId = connectedUsers.get(partnerSocketId);

    // Notify users that they are connected
    io.to(socket.id).emit('connected', { userId: currentUserId, partnerUserId });
    io.to(partnerSocketId).emit('connected', { userId: partnerUserId, partnerUserId: currentUserId });
  } else {
    // Add current user to the waiting list if not already there
    if (!waitingUsers.includes(socket.id)) {
      waitingUsers.push(socket.id);
    }
  }
};



module.exports = {
  getChatHistory,
  saveChatMessage,
  trackUser,
  removeUser,
  getConnectedUsers, 
  connectRandomUsers,

};