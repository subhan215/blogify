const { Router } = require("express");
const path = require("path");
const multer = require("multer");
const { getLatestNotificationsHandler, getAllNotificationsHandler, getSignUpPage, getSignInPage, postUser, postSignIn, logOutHandler, delLatestNotificationsHandler, delAllNotificationsHandler } = require("../controllers/user");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });
const router = Router();
// notifications route ///
router.get("/:userId/latestNotifications" , getLatestNotificationsHandler)
router.get("/:userId/allNotifications" , getAllNotificationsHandler)
router.get("/:userId/latestNotificationDel/:blogId" ,delLatestNotificationsHandler)
router.get("/:userId/allNotificationDel/:blogId" ,delAllNotificationsHandler)
router.get("/signup", getSignUpPage);
router.get("/signin", getSignInPage);
router.post("/signup",upload.single("coverImage") ,postUser);
router.post("/signin", postSignIn);
router.get("/logout" , logOutHandler)
const userRoute = router;
module.exports = userRoute;
