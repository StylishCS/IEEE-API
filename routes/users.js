var express = require("express");
var router = express.Router();
const upload = require("../utils/uploadImage");
const auth = require("../middlewares/protect");
const {
  signupController,
  verify,
  resendOTP,
  resetRequest,
  resetPassword,
} = require("../controllers/signupController");
const { loginController } = require("../controllers/loginController");

router.post("/signup", signupController);
router.post("/verify", auth, verify);
router.post("/resend-otp", auth, resendOTP);
router.post("/login", loginController);
router.post("/forgot-password-otp", resendOTP);
router.post("/forgot-password-verify", resetRequest);
router.post("/forgot-password-reset", auth, resetPassword);

module.exports = router;
