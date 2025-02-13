const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const communiytController = require("../controllers/community.controller");
const checkAuth = require("../utils/checkAuth");

const storage = multer.diskStorage({
  destination: "./public/uploads/posts",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.get("/community", communiytController.getCommunity);
router.get("/community/:id", communiytController.getCommunityDetail);

router.post("/community/:id/comment", checkAuth.requirePostLogin, communiytController.Comment);
router.post("/community/comment/:id/reply", checkAuth.requirePostLogin, communiytController.ReplyComment);
router.post("/community/:id/like", checkAuth.requirePostLogin, communiytController.ClickCPostLike);

router.get("/insert-post", checkAuth.requireAdmin, communiytController.getInsertPost);
router.post(
  "/insert-post",
  upload.fields([
    { name: "img1", maxCount: 1 },
    { name: "img2", maxCount: 1 },
    { name: "img3", maxCount: 1 },
    { name: "img4", maxCount: 1 },
    { name: "img5", maxCount: 1 },
  ]),
  checkAuth.requireAdmin,
  communiytController.InsertPost,
);

module.exports = router;
