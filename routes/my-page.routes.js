const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const mypageController = require("../controllers/mypage.controller");

const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.get("/my-page", mypageController.getMypage);

router.post(
  "/upload-profile-photo",
  upload.single("profilePhoto"),
  mypageController.uploadProfileImg,
);

// 닉네임 수정
router.get("/change-username", mypageController.getChangeNickname);
router.post("/change-username", mypageController.changeNickname);

// 이름 수정
router.get("/change-name", mypageController.getChangeName);
router.post("/change-name", mypageController.changeName);

module.exports = router;
