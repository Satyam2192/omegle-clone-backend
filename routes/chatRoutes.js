const express = require('express');
const router = express.Router();
const { getChatHistory, saveChatMessage } = require('../controllers/chatController');

router.get('/chat/history', getChatHistory);

router.post('/chat/message', (req, res) => {
  const { message } = req.body;
  saveChatMessage(message);
  res.status(200).end();
});

router.post('/chat/skip', (req, res) => {
  const { userId } = req.body;
  removeUser(userId);
  res.status(200).end();
});

module.exports = router;
