const { Router } = require("express");
const { getProfile, followUserHandler } = require("../controllers/profile");
const router = Router();
router.get("/:userId", getProfile);
router.get("/:logInUser/follow/:blogUser", followUserHandler);
const profRoute = router;
module.exports = profRoute;
