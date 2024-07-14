const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8000;
const path = require("path");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const cookieParser = require("cookie-parser");
const { connectMongoDb } = require("./connection/connection");
const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");
const Blog = require("./models/blog");
const profRoute = require("./routes/profile");
connectMongoDb(process.env.MONGOD_CONNECT_URI);
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));
app.post("/", async (req, res) => {});
app.get("/", async (req, res) => {
  const filter = req.query.filterBy;
  const search = req.query.search;
  let blogs = await Blog.find({});
  if (filter) {
    try {
      if (filter === "Likes") {
        console.log("likes sort: ");
        blogs = blogs.sort((a, b) => b.likes.length - a.likes.length);
      } else if (filter === "Recent") {
        console.log("recent sort");
        blogs = blogs.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      } else if (filter === "Views") {
        console.log("views sort");
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
        console.log(search)
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

app.use("/profile" , profRoute)
app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => {
  console.log("server connected!");
});
