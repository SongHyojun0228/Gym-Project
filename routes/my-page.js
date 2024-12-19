const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../data/database");
const router = express.Router();

const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

router.get("/my-page", async function (req, res) {
  const sessionUser = req.session.user;

  const user = await db
    .getDb()
    .collection("User")
    .findOne({ username: sessionUser.username });
    console.log(user);

  res.render("my-page", { user: user });
});

const upload = multer({ storage: storage });
router.post(
  "/upload-profile-photo",
  upload.single("profilePhoto"),
  async function (req, res) {
    try {
      const sessionUser = req.session.user;
      const profileImgPath = `/uploads/${req.file.filename}`;

      await db
        .getDb()
        .collection("User")
        .updateOne(
          { username: sessionUser.username },
          { $set: { user_img: profileImgPath } }
        );

      req.session.user.user_img = profileImgPath;

      return res.redirect("/my-page");
    } catch (error) {
      console.error("프로필 이미지 업데이트 중 오류 발생:", error);
      return res.redirect("/404");
    }
  }
);

// 닉네임 수정
router.get("/change-username", async function (req, res) {
  const sessionUser = req.session.user;

  const user = await db
    .getDb()
    .collection("User")
    .findOne({ username: sessionUser.username });
  console.log(user);
  res.render("change-username", { user: user, message: "" });
});

router.post("/change-username", async function (req, res) {
  const sessionUser = req.session.user;
  const enteredUsername = req.body.username;
  const message = "";

  const user = await db
    .getDb()
    .collection("User")
    .findOne({ username: sessionUser.username });

  const existingUser = await db
    .getDb()
    .collection("User")
    .findOne({ username: enteredUsername });

  if (existingUser) {
    return res.render("change-username", {
      user: user,
      message: "이미 사용 중인 닉네임입니다.",
    });
  }

  await db
    .getDb()
    .collection("User")
    .updateOne(
      { username: sessionUser.username },
      { $set: { username: enteredUsername } }
    );

  await db
    .getDb()
    .collection("Posts")
    .updateMany(
      { author: sessionUser.username },
      { $set: { author: enteredUsername } }
    );

  await db
    .getDb()
    .collection("Comments")
    .updateMany(
      { author: sessionUser.username },
      { $set: { author: enteredUsername } }
    );

  req.session.user.username = enteredUsername;

  res.redirect("my-page");
});

// 이름 수정
router.get("/change-name", async function (req, res) {
  const sessionUser = req.session.user;

  const user = await db
    .getDb()
    .collection("User")
    .findOne({ username: sessionUser.username });
  console.log(user);
  res.render("change-name", { user: user });
});

router.post("/change-name", async function (req, res) {
  const sessionUser = req.session.user;
  const enteredName = req.body.name;

  const user = await db
    .getDb()
    .collection("User")
    .findOne({ username: sessionUser.username });

  await db
    .getDb()
    .collection("User")
    .updateOne(
      { username: sessionUser.username },
      { $set: { name: enteredName } }
    );

  res.redirect("my-page");
});

// 키몸무게 수정
router.get("/change-body", async function (req, res) {
  const sessionUser = req.session.user;

  const user = await db
    .getDb()
    .collection("User")
    .findOne({ username: sessionUser.username });
  console.log(user);
  res.render("change-body", { user: user });
});

router.post("/change-body", async function (req, res) {
  const sessionUser = req.session.user;
  const enteredHeight = req.body.height;
  const enteredWeight = req.body.weight;

  const user = await db
    .getDb()
    .collection("User")
    .findOne({ username: sessionUser.username });

  await db
    .getDb()
    .collection("User")
    .updateOne(
      { username: sessionUser.username },
      { $set: { height: enteredHeight, weight: enteredWeight } }
    );

  res.redirect("my-page");
});

// 생일 수정
router.get("/change-birth", async function (req, res) {
  const sessionUser = req.session.user;

  const user = await db
    .getDb()
    .collection("User")
    .findOne({ username: sessionUser.username });
  console.log(user);
  res.render("change-birth", { user: user });
});

router.post("/change-birth", async function (req, res) {
  const sessionUser = req.session.user;
  const enteredBirth = req.body.birth;

  const user = await db
    .getDb()
    .collection("User")
    .findOne({ username: sessionUser.username });

  await db
    .getDb()
    .collection("User")
    .updateOne(
      { username: sessionUser.username },
      { $set: { birth: enteredBirth } }
    );

  res.redirect("my-page");
});

// 이메일 수정
router.get("/change-email", async function (req, res) {
  const sessionUser = req.session.user;

  const user = await db
    .getDb()
    .collection("User")
    .findOne({ username: sessionUser.username });
  console.log(user);
  res.render("change-email", { user: user, message: "" });
});

router.post("/change-email", async function (req, res) {
  const sessionUser = req.session.user;
  const enteredEmail = req.body.email;

  const user = await db
    .getDb()
    .collection("User")
    .findOne({ username: sessionUser.username });

  const existingUser = await db
    .getDb()
    .collection("User")
    .findOne({ email: enteredEmail });

  if (existingUser) {
    return res.render("change-username", {
      user: user,
      message: "이미 사용 중인 메일입니다.",
    });
  }

  await db
    .getDb()
    .collection("User")
    .updateOne(
      { username: sessionUser.username },
      { $set: { email: enteredEmail } }
    );

  res.redirect("my-page");
});

module.exports = router;
