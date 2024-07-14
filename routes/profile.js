const { Router } = require("express");
const { getProfile, followUserHandler } = require("../controllers/profile");
const User = require("../models/user");
const router = Router();
router.get("/:userId", getProfile);
router.get("/:logInUser/follow/:blogUser", followUserHandler);
router.get("/:userId/privateMessage" , async (req , res) => {
    const user = await User.findById(req.params.userId)
    console.log(user)
    res.render("privateMessaging" , {
        currentRoute: "/privateMessaging" , 
        user: req.user , 
        blogUser: user
    })
})
const profRoute = router;
module.exports = profRoute;
