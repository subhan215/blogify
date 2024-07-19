const Blog = require("../models/blog");
const Comment = require("../models/comment");
const notificationMsg = require("../models/notificationMsg");
const User = require("../models/user");
async function getProfile(req, res) {
  const user = await User.findById(req.params.userId);
  let followUnfollowBool = false;
  if (req.user) {
    if (user.followers.includes(req.user._id)) {
      followUnfollowBool = true;
    } else {
      followUnfollowBool = false;
    }
  }
  let followers = [];
  let followings = [];
  for (i = 0; i < user.followers.length; i++) {
    let follower = await User.findById(user.followers[i]);
    followers.push(follower);
  }
  for (i = 0; i < user.following.length; i++) {
    let following = await User.findById(user.following[i]);
    followings.push(following);
  }
  const blogs = await Blog.find({ createdBy: user._id });
  const messageNotifications = await notificationMsg.find({recipientId: req.user._id}) 
  console.log(messageNotifications)
  return res.render("profile", {
    currentRoute: "/profile",
    blogUser: user,
    user: req.user,
    followUnfollowBool,
    followers,
    followings,
    blogs,
    messageNotifications
  });
}
async function followUserHandler(req , res) {
    if (req.params.logInUser != req.params.blogUser) {
        let user = await User.findById(req.params.blogUser);
        console.log("first: ", user._id);
        if(!user.followers.includes(req.params.logInUser)) {
            user.followers.push(req.params.logInUser);
            await User.findByIdAndUpdate(user._id, {
              ...user,
            });
            user = await User.findById(req.params.logInUser);
            console.log("second: ", user._id);
            user.following.push(req.params.blogUser);
            await User.findByIdAndUpdate(user._id, {
              ...user,
            });
        }
        else {
            let index = user.followers.indexOf(req.params.logInUser)
            user.followers.splice( index, 1);
            await User.findByIdAndUpdate(user._id, {
              ...user,
            });
            user = await User.findById(req.params.logInUser);
            console.log("second: ", user._id);
            index = user.followers.indexOf(req.params.blogUser)
            user.following.splice( index, 1);
            await User.findByIdAndUpdate(user._id, {
              ...user,
            });
        }
        
      }
    
      return res.redirect(`/profile/${req.params.blogUser}`);
}
module.exports = {
    getProfile , 
    followUserHandler , 
};
