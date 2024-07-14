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
        }
    });

    // Handle private messaging
    socket.on('private_message', async (data) => {
        const { senderId, recipientId, message } = data;
        const recipientSocketId = connectedUsers[recipientId];
        if (recipientSocketId) {
            const sender = await User.findById(senderId);
            if (sender) {
                io.to(recipientSocketId).emit('private_message', {
                    sender: sender.fullName,
                    message: message
                });
            }
        } else {
            console.log('Recipient not connected');
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        for (let userId in connectedUsers) {
            if (connectedUsers[userId] === socket.id) {
                delete connectedUsers[userId];
                break;
            }
        }
        console.log('A user disconnected: ' + socket.id);
    });
});

require("dotenv").config();
const PORT = process.env.PORT || 8000;
const path = require("path");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const cookieParser = require("cookie-parser");
const { connectMongoDb } = require("./connection/connection");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const Blog = require("./models/blog");
const profRoute = require("./routes/profile");

connectMongoDb(process.env.MONGOD_CONNECT_URI);
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));
app.get("/", async (req, res) => {
  const filter = req.query.filterBy;
  const search = req.query.search;
  let blogs = await Blog.find({});
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
          blogs: blogs,
          currentRoute: "/",
          user: req.user,
        });
      }
      return res.render("home", {
        blogs: blogs,
        currentRoute: "/",
        user: req.user,
      });
    } catch (err) {
      return res.status(500).render("home", {
        blogs: blogs,
        currentRoute: "/",
        user: req.user,
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

      return res.render("home", {
        blogs: blogs,
        currentRoute: "/",
        user: req.user,
      });
    } catch (err) {
      console.error(err);
      return res.render("home", {
        blogs: blogs,
        currentRoute: "/",
        user: req.user,
      });
    }
  }
  return res.render("home", {
    blogs: blogs,
    currentRoute: "/",
    user: req.user,
  });
});

app.use("/profile", profRoute);
app.use("/user", userRoute);
app.use("/blog", blogRoute);

server.listen(PORT, () => {
  console.log("server connected!");
});
