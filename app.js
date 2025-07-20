const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const User = require("./models/user");
let connectedUsers = {};

// Socket.IO setup
io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    // Register user on connection
    socket.on('register', async (userId) => {
        const user = await User.findById(userId);
        if (user) {
            connectedUsers[userId] = socket.id;
            console.log('Registered user: ', user.fullName, ' with socket ID: ', socket.id);
            
            // Notify other users that this user is now online
            socket.broadcast.emit('user_status_change', {
                userId: userId,
                isOnline: true
            });
        }
    });

    // Check if a user is online
    socket.on('check_online_status', (targetUserId) => {
        const isOnline = connectedUsers.hasOwnProperty(targetUserId);
        socket.emit('online_status', {
            userId: targetUserId,
            isOnline: isOnline
        });
    });

    // Handle private messaging
    socket.on('private_message', async (data) => {
        const { senderId, recipientId, message, chatId } = data;
        const recipientSocketId = connectedUsers[recipientId];
        const sender = await User.findById(senderId);
        
        if (sender) {
            // Create or get chat
            let chat = await Chat.findOne({
                participants: { $all: [senderId, recipientId] }
            });
            
            if (!chat) {
                chat = new Chat({
                    participants: [senderId, recipientId],
                    unreadCount: new Map()
                });
                await chat.save();
            }
            
            // Create message
            const newMessage = new Message({
                senderId,
                recipientId,
                chatId: chat._id,
                content: message,
                senderName: sender.fullName
            });
            await newMessage.save();
            
            // Update chat with last message info
            chat.lastMessage = newMessage._id;
            chat.lastMessageContent = message;
            chat.lastMessageTime = new Date();
            
            // Increment unread count for recipient
            const currentUnread = chat.unreadCount.get(recipientId.toString()) || 0;
            chat.unreadCount.set(recipientId.toString(), currentUnread + 1);
            await chat.save();
            
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('private_message', {
                    sender: sender.fullName,
                    message: message,
                    chatId: chat._id
                });
            }
            
            // Create notification
            await notificationMsg.create({
                senderId,
                recipientId,
                senderName: sender.fullName
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        let disconnectedUserId = null;
        for (let userId in connectedUsers) {
            if (connectedUsers[userId] === socket.id) {
                disconnectedUserId = userId;
                delete connectedUsers[userId];
                break;
            }
        }
        if (disconnectedUserId) {
            console.log('User disconnected: ' + disconnectedUserId);
            // Notify other users that this user is now offline
            socket.broadcast.emit('user_status_change', {
                userId: disconnectedUserId,
                isOnline: false
            });
        }
        console.log('A user disconnected: ' + socket.id);
    });
});

require("dotenv").config();
const PORT = process.env.PORT || 8000;
const path = require("path");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const chatRoute = require("./routes/chat");
const cookieParser = require("cookie-parser");
const { connectMongoDb } = require("./connection/connection");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const Blog = require("./models/blog");
const profRoute = require("./routes/profile");
const Message = require("./models/message");
const Chat = require("./models/chat");
const notificationMsg = require("./models/notificationMsg");
const { getUnreadChatCount } = require("./controllers/chat");

connectMongoDb(process.env.MONGOD_CONNECT_URI);
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Security headers middleware
app.use((req, res, next) => {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://code.jquery.com https://cdn.jsdelivr.net https://stackpath.bootstrapcdn.com; style-src 'self' 'unsafe-inline' https://stackpath.bootstrapcdn.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.cloudinary.com; frame-src 'self'; object-src 'none';"
  );
  
  // Other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Allow mixed content for development (remove in production)
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:; style-src 'self' 'unsafe-inline' https: http:; font-src 'self' https: http: data:; img-src 'self' data: https: http: blob:; connect-src 'self' https: http:; frame-src 'self'; object-src 'none';");
  }
  
  next();
});

app.use(express.static(path.resolve("./public")));

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

app.get("/", async (req, res) => {
  const messageNotifications = await notificationMsg.find({recipientId: req.user?._id});
  
  // Get unread chat count only for home page
  let unreadChats = 0;
  if (req.user && req.user._id) {
    unreadChats = await getUnreadChatCount(req.user._id);
  }
  
  const filter = req.query.filterBy;
  const search = req.query.search;
  const page = parseInt(req.query.page) || 1;
  const limit = 6; // Number of blogs per page
  const skip = (page - 1) * limit;

  let blogs = await Blog.find({});
  let totalBlogs = blogs.length;
  let totalPages = Math.ceil(totalBlogs / limit);

  if (filter) {
    try {
      if (filter === "Likes") {
        blogs = blogs.sort((a, b) => b.likes.length - a.likes.length);
      } else if (filter === "Recent") {
        blogs = blogs.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      } else if (filter === "Views") {
        blogs = blogs.sort((a, b) => b.views - a.views);
      } else {
        return res.status(400).render("home", {
          blogs: blogs.slice(skip, skip + limit),
          totalBlogs: totalBlogs,
          currentRoute: "/",
          user: req.user,
          messageNotifications,
          unreadChats,
          pagination: {
            currentPage: page,
            totalPages: totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1
          }
        });
      }
      return res.render("home", {
        blogs: blogs.slice(skip, skip + limit),
        totalBlogs: totalBlogs,
        currentRoute: "/",
        user: req.user,
        messageNotifications,
        unreadChats,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          nextPage: page + 1,
          prevPage: page - 1
        }
      });
    } catch (err) {
      return res.status(500).render("home", {
        blogs: blogs.slice(skip, skip + limit),
        totalBlogs: totalBlogs,
        currentRoute: "/",
        user: req.user,
        messageNotifications,
        unreadChats,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          nextPage: page + 1,
          prevPage: page - 1
        }
      });
    }
  } else if (search) {
    try {
      blogs = await Blog.find({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { body: { $regex: search, $options: "i" } },
        ],
      });
      totalBlogs = blogs.length;
      totalPages = Math.ceil(totalBlogs / limit);

      return res.render("home", {
        blogs: blogs.slice(skip, skip + limit),
        totalBlogs: totalBlogs,
        currentRoute: "/",
        user: req.user,
        messageNotifications,
        unreadChats,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          nextPage: page + 1,
          prevPage: page - 1
        }
      });
    } catch (err) {
      console.error(err);
      return res.render("home", {
        blogs: blogs.slice(skip, skip + limit),
        totalBlogs: totalBlogs,
        currentRoute: "/",
        user: req.user,
        messageNotifications,
        unreadChats,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          nextPage: page + 1,
          prevPage: page - 1
        }
      });
    }
  }
  return res.render("home", {
    blogs: blogs.slice(skip, skip + limit),
    totalBlogs: totalBlogs,
    currentRoute: "/",
    user: req.user,
    messageNotifications,
    unreadChats,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1
    }
  });
});



app.use("/profile", profRoute);
app.use("/user", userRoute);
app.use("/blog", blogRoute);
app.use("/chats", chatRoute);
app.use("/chat", chatRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send('Something broke!');
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

server.listen(PORT, () => {
  console.log("server connected!");
});
