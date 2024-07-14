const Blog = require("../models/blog");
const Comment = require("../models/comment");
const User = require("../models/user");

async function getLatestNotificationsHandler(req , res) {
    let user  = await User.findById(req.params.userId); 
  let notifications = user.notifications
  notifications = notifications.sort((a , b)=> new Date(b.timeStamp) - new Date(a.timeStamp) )
  let latestNotifications = []
  for(j=0 , i = notifications.length - 5 ; i < notifications.length ; i++ ) {
    if(notifications[i] == null) {
      continue ; 
    }
      latestNotifications[j] = notifications[i]
      j++
  } 
  return res.render("notifications" , {
      notifications: latestNotifications , 
      currentRoute: "/notifications" , 
      user: req.user , 
      text: "Latest"
      
  })
}
async function getAllNotificationsHandler(req , res) {
    let user  = await User.findById(req.params.userId); 
  let notifications = user.notifications
  notifications = notifications.sort((a , b)=> new Date(b.timeStamp) - new Date(a.timeStamp) )
  let latestNotifications = []
  for(j=0 , i = notifications.length - 5 ; i < notifications.length ; i++ ) {
    if(notifications[i] == null) {
      continue ; 
    }
      latestNotifications[j] = notifications[i]
      j++
  } 
  return res.render("notifications" , {
      notifications: latestNotifications , 
      currentRoute: "/notifications" , 
      user: req.user , 
      text: "All"
      
  })
}
async function delLatestNotificationsHandler(req , res) {
    let user = await User.findById(req.params.userId) ; 
    let index = -1
    for(i = 0 ; i < user.notifications.length ; i++) {
      if(user.notifications[i].blogId == req.params.blogId) {
        index = i ; 
      }
    }
    user.notifications.splice(index , 1)
    await User.findByIdAndUpdate(user._id , {
      ...user
    })
    return res.redirect(`/user/${req.params.userId}/latestNotifications`)
}
async function delAllNotificationsHandler(req , res) {
  let user = await User.findById(req.params.userId) ; 
  let index = -1
  for(i = 0 ; i < user.notifications.length ; i++) {
    if(user.notifications[i].blogId == req.params.blogId) {
      index = i ; 
    }
  }
  user.notifications.splice(index , 1)
  await User.findByIdAndUpdate(user._id , {
    ...user
  })
  return res.redirect(`/user/${req.params.userId}/allNotifications`)
}
async function getSignUpPage(req  , res) {
    return res.render("signup"  , {
        currentRoute: "/user/signup"
      });
}
async function getSignInPage(req  , res) {
    return res.render("signin" , {
        currentRoute: "/user/signin"
      });
}
async function postUser(req , res) {
    const { fullName, email, password } = req.body;
    await User.create({
      fullName,
      email,
      password,
      followers: [] , 
      following: [] , 
      profileImageURL: `/uploads/${req.file.filename}`
    });
    return res.redirect("/");
}
async function postSignIn(req , res) {
    const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    console.log("token: ", token);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
        return res.render("signin" , {
            error: "Incorrect Email Or Password!" , 
            currentRoute: "/signin"
        })
  }
}
async function logOutHandler(req , res) {
    res.clearCookie("token").redirect("/")
}
module.exports = {
    getLatestNotificationsHandler , 
    getAllNotificationsHandler , 
    delLatestNotificationsHandler , 
    delAllNotificationsHandler , 
    getSignUpPage ,
    getSignInPage , 
    postUser , 
    postSignIn , 
    logOutHandler
}