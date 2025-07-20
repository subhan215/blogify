const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authentication');
const { 
    getChats, 
    getOrCreateChat, 
    getChat, 
    sendMessage 
} = require('../controllers/chat');

// Get all chats for the logged-in user
router.get('/', authenticateToken, getChats);

// Create a new chat or get existing chat with a user
router.get('/start/:recipientId', authenticateToken, getOrCreateChat);

// Get specific chat with messages
router.get('/:chatId', authenticateToken, getChat);

// Send a message in a chat
router.post('/:chatId/message', authenticateToken, sendMessage);

module.exports = router; 