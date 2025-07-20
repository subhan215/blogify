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
app.use(express.static(path.resolve("./public")));
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

server.listen(PORT, () => {
  console.log("server connected!");
});
