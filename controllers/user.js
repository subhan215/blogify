const Blog = require("../models/blog");
const Comment = require("../models/comment");
const User = require("../models/user");
const notificationMsg = require("../models/notificationMsg");
const { uploadToCloudinary } = require("../config/cloudinary");
const path = require("path");

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
  const messageNotifications = await notificationMsg.find({recipientId: req.user?._id})
  return res.render("notifications" , {
      notifications: latestNotifications , 
      currentRoute: "/notifications" , 
      user: req.user , 
      text: "Latest" , 
      messageNotifications
      
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
  const messageNotifications = await notificationMsg.find({recipientId: req.user?._id})
  return res.render("notifications" , {
      notifications: latestNotifications , 
      currentRoute: "/notifications" , 
      user: req.user , 
      text: "All" , 
      messageNotifications
      
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
    
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("signup", {
                error: "An account with this email already exists. Please use a different email or sign in.",
                currentRoute: "/user/signup",
                formData: { fullName, email } // Preserve form data except password
            });
        }

        let profileImageURL = '';
        
        // If a file was uploaded, upload it to Cloudinary
        if (req.file) {
            const filePath = path.join(__dirname, '..', 'public', 'uploads', req.file.filename);
            const uploadResult = await uploadToCloudinary(filePath, 'blogify/profiles');
            
            if (uploadResult.success) {
                profileImageURL = uploadResult.url;
            } else {
                console.error('Failed to upload image to Cloudinary:', uploadResult.error);
                // Fallback to local file if Cloudinary upload fails
                profileImageURL = `/uploads/${req.file.filename}`;
            }
        }
        
        await User.create({
            fullName,
            email,
            password,
            followers: [], 
            following: [], 
            profileImageURL: profileImageURL
        });
        
        return res.redirect("/");
    } catch (error) {
        console.error("Signup error:", error);
        
        // Handle MongoDB duplicate key error
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.render("signup", {
                error: "An account with this email already exists. Please use a different email or sign in.",
                currentRoute: "/user/signup",
                formData: { fullName, email } // Preserve form data except password
            });
        }
        
        // Handle other validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.render("signup", {
                error: validationErrors.join(", "),
                currentRoute: "/user/signup",
                formData: { fullName, email } // Preserve form data except password
            });
        }
        
        // Handle general errors
        return res.render("signup", {
            error: "Something went wrong. Please try again.",
            currentRoute: "/user/signup",
            formData: { fullName, email } // Preserve form data except password
        });
    }
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
            currentRoute: "/signin",
            formData: { email } // Preserve email for convenience
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