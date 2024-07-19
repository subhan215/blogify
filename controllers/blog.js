const Blog = require("../models/blog");
const Comment = require("../models/comment");
const User = require("../models/user");
const langs = require("../languages");
const { default: mongoose } = require("mongoose");
const { response } = require("express");
const { translate } = require("@vitalets/google-translate-api");
const notificationMsg = require("../models/notificationMsg");
async function postBookmarkHandler(req, res) {
  let blog = await Blog.findById(req.params.blogId);
  let user = await User.findById(req.params.userId);
  let bookmarkIncluded = false;
  for (i = 0; i < user.bookmarks.length; i++) {
    if (user.bookmarks[i].blogId == req.params.blogId) {
      bookmarkIncluded = true;
      break;
    }
  }
  let newbookmarks = [];
  if (bookmarkIncluded) {
    for (i = 0, j = 0; i < user.bookmarks.length; i++) {
      if (user.bookmarks[i].blogId == req.params.blogId) {
        continue;
      }
      newbookmarks[j] = user.bookmarks[i];
      j++;
    }
    user.bookmarks = newbookmarks;
    await User.findByIdAndUpdate(req.params.userId, {
      ...user,
    });
  } else {
    await User.findByIdAndUpdate(req.params.userId, {
      $push: {
        bookmarks: {
          blogId: req.params.blogId,
          userId: req.params.userId,
          blogName: blog.title,
          createdAt: new Date(),
        },
      },
    });
  }
  return res.redirect(`/blog/${req.params.blogId}/${req.params.userId}`);
}
async function getBookmarkHandler(req, res) {
  let user = await User.findById(req.params.userId);
  user.bookmarks = user.bookmarks.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const notificationMessages = await notificationMsg.find({recipientId: req.user._id}) 
  return res.render("bookmarks", {
    user: req.user,
    currentRoute: "/bookmarks",
    bookmarks: user.bookmarks,
    notificationMessages
  });
}
async function delBookmarkHandler(req, res) {
  let user = await User.findById(req.params.userId);
  let index = -1;
  for (i = 0; i < user.bookmarks.length; i++) {
    if (user.bookmarks[i].blogId == req.params.blogId) {
      index = i;
    }
  }
  user.bookmarks.splice(index, 1);
  await User.findByIdAndUpdate(user._id, {
    ...user,
  });
  return res.redirect(`/blog/${req.params.userId}/bookmarks`);
}
async function likeBookmarkHandler(req, res) {
  let user = await User.findById(req.params.userId);
  let index = -1;
  for (i = 0; i < user.bookmarks.length; i++) {
    if (user.bookmarks[i].blogId == req.params.blogId) {
      index = i;
    }
  }
  user.bookmarks.splice(index, 1);
  await User.findByIdAndUpdate(user._id, {
    ...user,
  });
  return res.redirect(`/blog/${req.params.userId}/bookmarks`);
}
async function likeBookmarkHandler(req, res) {
  const blog = await Blog.findById(req.params.blogId);
  if (!blog.likes.includes(req.user._id)) {
    blog.likes.push(req.user._id);
  } else {
    const blogIndex = blog.likes.indexOf(req.user._id);
    blog.likes.splice(blogIndex, 1);
  }
  await blog.save();
  return res.redirect(`/blog/${req.params.blogId}/${req.user._id}`);
}
async function delUserHandler(req, res) {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  console.log("blog:", blog);
  return res.redirect("/");
}
async function postCommentHandler(req, res) {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment.likes.includes(req.user._id)) {
    comment.likes.push(req.user._id);
  } else {
    const commentIndex = comment.likes.indexOf(req.user._id);
    comment.likes.splice(commentIndex, 1);
  }
  await comment.save();
  return res.redirect(`/blog/${req.params.blogId}/${req.user._id}`);
}
async function getUpdateBlogHandler(req, res) {
  const blog = await Blog.findById(req.params.id);
  const notificationMessages = await notificationMsg.find({recipientId: req.user._id}) 
  return res.render("updateBlog", {
    blog,
    currentRoute: "/updateBlog",
    notificationMessages
  });
}
async function postUpdateBlogHandler(req, res) {
  const { updBody, updTitle } = req.body;
  console.log(updBody, updTitle);
  const blog = await Blog.findByIdAndUpdate(req.params.id, {
    title: updTitle,
    body: updBody,
  });
  return res.redirect(`/blog/${req.params.id}/${blog.createdBy._id}`);
}
async function getAddNewBlogHandler(req, res) {
  const notificationMessages = await notificationMsg.find({recipientId: req.user._id}) 
  return res.render("addBlog", {
    user: req.user,
    currentRoute: "/add-new",
    notificationMessages
  });
}
async function getBlogHandler(req, res) {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
  if (blog.createdBy._id != req.params.userId) {
    blog.views += 1;
  }
  await Blog.findByIdAndUpdate(req.params.id, { views: blog.views });
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );

  console.log(req.user);
  let likeUnlikeString = false;
  if (req.user) {
    if (blog.likes.includes(req.user._id)) {
      likeUnlikeString = true;
    } else {
      likeUnlikeString = false;
    }
  }

  let user = await User.findById(req.params.userId);
  let bookmarkBool = false;
  if(user) {
    for (i = 0; i < user.bookmarks.length; i++) {
      if (user.bookmarks[i].blogId == req.params.id) {
        bookmarkBool = true;
        break;
      }
    }
  }
  let translateTo = req.query.translate
  let translated = {
    bool: false , 
    text: ""
  }
  if(translateTo) {
    const { text } = await translate(blog.body, { to: langs[translateTo] });

console.log(text) 
translated.bool = true
translated.text = text
  }
  const notificationMessages = await notificationMsg.find({recipientId: req.user._id}) 
  return res.render("blog", {
    user: req.user,
    blog: blog,
    comments,
    currentRoute: "",
    likeUnlikeString,
    bookmarkBool,
    translated , 
    notificationMessages
  });
  }
  async function postNewCommentHandler(req, res) {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
      });
      return res.redirect(`/blog/${req.params.blogId}/${req.user._id}`);
  }
  async function delCommentHandler(req , res) {
    const comment = await Comment.findById(req.params.id);
  const blogId = comment.blogId;
  await Comment.findByIdAndDelete(req.params.id);
  return res.redirect(`/blog/${blogId}/${req.params.userId}`);
  }
  async function postUpdateCommentHandler(req , res) {
    const { updatedComment } = req.body;
  const comment = await Comment.findByIdAndUpdate(req.params.commentId, {
    content: updatedComment,
  });
  return res.redirect(`/blog/${req.params.blogId}/${comment.createdBy._id}`);
  }
async function postBlogHandler(req, res) {
    const { title, body } = req.body;
  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  let user = await User.findById(req.user._id);
  const notifications = user.followers.map((follower) => {
    return User.findByIdAndUpdate(follower._id, {
      $push: {
        notifications: {
          blogId: blog._id,
          message: `${user.fullName} has posted a new blog!`,
          timestamp: new Date(),
          userIdOfBlog: req.user._id,
        },
      },
    });
  });
  await Promise.all(notifications);
  return res.redirect(`/blog/${blog._id}/${req.user._id}`);
}

module.exports = {
  postBookmarkHandler,
  getBookmarkHandler,
  delBookmarkHandler,
  likeBookmarkHandler,
  delUserHandler,
  postCommentHandler,
  getUpdateBlogHandler,
  postUpdateBlogHandler,
  getAddNewBlogHandler,
  getBlogHandler , 
  postNewCommentHandler , 
  delCommentHandler , 
  postUpdateCommentHandler , 
  postBlogHandler
};
