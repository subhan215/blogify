const { Router } = require("express");
const { getProfile, followUserHandler } = require("../controllers/profile");
const User = require("../models/user");
const Message = require("../models/message");
const notificationMsg = require("../models/notificationMsg");
const router = Router();
router.get("/:userId", getProfile);
router.get("/:logInUser/follow/:blogUser", followUserHandler);
router.get("/:userId/privateMessage" , async (req , res) => {
    const user = await User.findById(req.params.userId)
    const messages = await Message.find({
        $or: [
          { senderId: req.user._id  , recipientId: user._id},
          { recipientId: req.user._id , senderId: user._id }
        ]
      });
    for(i = 0 ; i < messages.length ; i++) {
            if(req.user._id == messages[i].recipientId) {
                await Message.findByIdAndUpdate(messages[i]._id , {
                    delivered: true
                })
            }
            
    }  
    const messageNotifications = await notificationMsg.find({recipientId: req.user._id})
    let updatedMsgNotifications = []
    for(i = 0 , j = 0  ; i < messageNotifications.length ; i++) {
        if(messageNotifications[i].recipientId == req.user._id) {
             await notificationMsg.findByIdAndDelete(messageNotifications[i]._id)
        }
        updatedMsgNotifications[j] = messageNotifications[i]
        j++
    }
    console.log(user)
    res.render("privateMessaging" , {
        currentRoute: "/privateMessaging" , 
        user: req.user , 
        blogUser: user , 
        messages
    })
})
router.get("/:userId/messageNotifications", async (req, res) => {
    const user = await User.findById(req.params.userId);
    let messageNotifications = await notificationMsg.find({ recipientId: req.user?._id });

    // Group notifications by senderId
    const groupedNotifications = messageNotifications.reduce((acc, notification) => {
        if (!acc[notification.senderId]) {
            acc[notification.senderId] = { senderName: notification.senderName, count: 0 };
        }
        acc[notification.senderId].count++;
        return acc;
    }, {});

    // Convert grouped notifications to array of entries for easier iteration in template
    const groupedNotificationsArray = Object.entries(groupedNotifications);
    console.log(groupedNotificationsArray)
    messageNotifications = groupedNotificationsArray
    res.render("messageNotifications", {
        currentRoute: "messageNotifications",
        user: req.user,
        blogUser: user,
        messageNotifications
    });
});


const profRoute = router;
module.exports = profRoute;
