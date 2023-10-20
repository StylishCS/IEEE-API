var express = require("express");
var router = express.Router();
const passport = require("passport");
const upload = require("../utils/uploadImage");
const auth = require("../middlewares/protect");
const { getEvent, getEvents } = require("../controllers/eventsController");
const {
  signupController,
  verify,
  resendOTP,
  resetRequest,
  resetPassword,
  updateUserAccount,
  google,
} = require("../controllers/signupController");
const {
  loginController,
  currentUserController,
} = require("../controllers/loginController");

router.post("/signup", signupController);
router.post("/verify", auth, verify);
router.post("/resend-otp", auth, resendOTP);
router.post("/login", loginController);
router.post("/forgot-password-otp", resendOTP);
router.post("/forgot-password-verify", resetRequest);
router.post("/forgot-password-reset", auth, resetPassword);
router.patch("/updateUser", auth, upload.single("image"), updateUserAccount);
router.get("/events", getEvents);
router.post("/event", getEvent);
router.post("/currentUser", auth, currentUserController);

router.get("/google", passport.authenticate("google", ["profile", "email"]));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "https://ieee-osb.onrender.com/users/success",
    failureRedirect: "https://ieee-osb.onrender.com/users/failure",
  })
);

router.get("/success", google);

router.get("/failure", async (req, res) => {
  res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
});

module.exports = router;
