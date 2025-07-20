const Chat = require('../models/chat');
const Message = require('../models/message');
const User = require('../models/user');

// Get all chats for a user
const getChats = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find all chats where user is a participant
        const chats = await Chat.find({
            participants: userId
        })
        .populate('participants', 'username fullName isOnline')
        .populate('lastMessage')
        .sort({ lastMessageTime: -1 });

        // Calculate unread counts
        const chatsWithUnread = chats.map(chat => {
            const unreadCount = chat.unreadCount.get(userId.toString()) || 0;
            return {
                ...chat.toObject(),
                unreadCount: chat.unreadCount
            };
        });

        res.render('chats', {
            user: req.user,
            chats: chatsWithUnread,
            currentRoute: '/chats',
            unreadChats: chatsWithUnread.reduce((total, chat) => {
                return total + (chat.unreadCount.get(userId.toString()) || 0);
            }, 0)
        });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
};

// Get or create a chat between two users
const getOrCreateChat = async (req, res) => {
    try {
        const { recipientId } = req.params;
        const senderId = req.user._id;

        if (senderId.toString() === recipientId) {
            return res.status(400).json({ error: 'Cannot chat with yourself' });
        }

        // Check if chat already exists
        let chat = await Chat.findOne({
            participants: { $all: [senderId, recipientId] }
        });

        if (!chat) {
            // Create new chat
            chat = new Chat({
                participants: [senderId, recipientId],
                unreadCount: new Map()
            });
            await chat.save();
        }

        res.redirect(`/chat/${chat._id}`);
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ error: 'Failed to create chat' });
    }
};

// Get specific chat with messages
const getChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        // Find chat and verify user is participant
        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        }).populate('participants', 'username fullName isOnline');

        if (!chat) {
            return res.status(404).render('error', { message: 'Chat not found' });
        }

        // Get messages for this chat
        const messages = await Message.find({ chatId })
            .populate('senderId', 'username fullName')
            .sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            { 
                chatId, 
                recipientId: userId, 
                read: false 
            },
            { read: true }
        );

        // Reset unread count for this user
        chat.unreadCount.set(userId.toString(), 0);
        await chat.save();

        // Get other participant
        const otherUser = chat.participants.find(p => p._id.toString() !== userId.toString());

        res.render('privateMessaging', {
            user: req.user,
            chat,
            messages,
            otherUser,
            currentRoute: '/chat'
        });
    } catch (error) {
        console.error('Error fetching chat:', error);
        res.status(500).json({ error: 'Failed to fetch chat' });
    }
};

// Send a message
const sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;
        const senderId = req.user._id;

        // Verify chat exists and user is participant
        const chat = await Chat.findOne({
            _id: chatId,
            participants: senderId
        }).populate('participants', 'username fullName');

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        // Get recipient (other participant)
        const recipientId = chat.participants.find(p => {
            const participantId = p._id ? p._id.toString() : p.toString();
            return participantId !== senderId.toString();
        });
        
        console.log('Debug - senderId:', senderId);
        console.log('Debug - recipientId:', recipientId);
        console.log('Debug - chat participants:', chat.participants.map(p => ({ 
            id: p._id ? p._id.toString() : p.toString(), 
            name: p.fullName || p.username 
        })));

        // Create message
        const message = new Message({
            senderId,
            recipientId,
            chatId,
            content,
            senderName: req.user.fullName || req.user.username
        });

        await message.save();

        // Update chat with last message info
        chat.lastMessage = message._id;
        chat.lastMessageContent = content;
        chat.lastMessageTime = new Date();
        
        // Increment unread count for recipient
        const recipientIdString = recipientId._id ? recipientId._id.toString() : recipientId.toString();
        const currentUnread = chat.unreadCount.get(recipientIdString) || 0;
        chat.unreadCount.set(recipientIdString, currentUnread + 1);
        
        await chat.save();

        // Populate sender info for response
        await message.populate('senderId', 'username fullName');

        res.json({ 
            success: true, 
            message: {
                _id: message._id,
                content: message.content,
                senderId: message.senderId,
                createdAt: message.createdAt,
                senderName: message.senderName
            }
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Get unread chat count for navbar
const getUnreadChatCount = async (userId) => {
    try {
        const chats = await Chat.find({ participants: userId });
        return chats.reduce((total, chat) => {
            return total + (chat.unreadCount.get(userId.toString()) || 0);
        }, 0);
    } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
};

module.exports = {
    getChats,
    getOrCreateChat,
    getChat,
    sendMessage,
    getUnreadChatCount
}; 