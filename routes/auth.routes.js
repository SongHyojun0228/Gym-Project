const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

router.get("/join", authController.getSignup);
router.post("/send-code", authController.sendVerificationCode);
router.post("/verify-code", authController.verifyCode);
router.post("/sign-up", authController.Signup);

router.get("/login", authController.getLogin);
router.post("/login", authController.Login);
router.post("/logout", authController.Logout);

router.get("/find-id", authController.getFindId);
router.post("/find-id", authController.FindId);
router.get("/find-pw", authController.getFindPw);
router.post("/find-pw", authController.FindPw);
router.post("/change-pw/:id", authController.ChangePw);

module.exports = router;
