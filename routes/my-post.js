const express = require("express");
const db = require("../data/database");
const router = express.Router();
const { ObjectId } = require("mongodb");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

function timeAgo(time) {
  const now = new Date();
  const diff = Math.floor((now - time) / 1000);

  if (diff < 60) {
    return `${diff}초 전`;
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}분 전`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}시간 전`;
  } else {
    const days = Math.floor(diff / 86400);
    return `${days}일 전`;
  }
}

router.get("/my-post", async function (req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }
  const user = req.session.user.username;
  const posts = await db
    .getDb()
    .collection("Post")
    .find({ author: user })
    .toArray();
  console.log(posts);

  posts.forEach((post) => {
    if (post.content.length > 30) {
      post.shortContent = post.content.substring(0, 30) + "...";
    } else {
      post.shortContent = post.content;
    }
    post.timeAgo = timeAgo(post.time);
  });

  res.render("my-post", { posts: posts });
});

router.post("/delete-post", async function (req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }
  const postId = req.body.postId;

  if (!ObjectId.isValid(postId)) {
    return res.status(400).send("잘못된 게시물 ID입니다.");
  }

  try {
    await db
      .getDb()
      .collection("Post")
      .deleteOne({ _id: new ObjectId(postId) });
    console.log(`게시물 삭제 성공: ${postId}`);
    res.redirect("/my-post");
  } catch (error) {
    console.error("게시물 삭제 중 오류:", error);
    res.status(500).render("500");
  }
});

router.get("/post/:id/edit", async function (req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection("Post")
    .findOne({ _id: new ObjectId(postId) });

  if (!post) {
    return res.status(404).render("404");
  }

  res.render("post-edit", { post: post });
});

router.post(
  "/my-post/:id/edit",
  upload.fields([
    { name: "img1", maxCount: 1 },
    { name: "img2", maxCount: 1 },
    { name: "img3", maxCount: 1 },
    { name: "img4", maxCount: 1 },
    { name: "img5", maxCount: 1 },
  ]),
  async function (req, res) {
    const postId = req.params.id;

    try {
      const existingPost = await db
        .getDb()
        .collection("Post")
        .findOne({ _id: new ObjectId(postId) });

      if (!existingPost) {
        return res
          .status(404)
          .render("404", { message: "게시물을 찾을 수 없습니다." });
      }

      const updatedImages = [];

      updatedImages[0] = req.files["img1"]
        ? `/uploads/${req.files["img1"][0].filename}`
        : existingPost.img[0];

      updatedImages[1] = req.files["img2"]
        ? `/uploads/${req.files["img2"][0].filename}`
        : existingPost.img[1];

      updatedImages[2] = req.files["img3"]
        ? `/uploads/${req.files["img3"][0].filename}`
        : existingPost.img[2];

      updatedImages[3] = req.files["img4"]
        ? `/uploads/${req.files["img4"][0].filename}`
        : existingPost.img[3];

      updatedImages[4] = req.files["img5"]
        ? `/uploads/${req.files["img5"][0].filename}`
        : existingPost.img[4];

      const updatedPost = {
        title: req.body.title,
        content: req.body.content,
        img: updatedImages,
      };

      await db
        .getDb()
        .collection("Post")
        .updateOne({ _id: new ObjectId(postId) }, { $set: updatedPost });

      console.log("게시물 수정 성공:", updatedPost);
      res.redirect("/my-post");
    } catch (error) {
      console.error("게시물 수정 중 오류:", error);
      res.status(500).render("500", { message: "서버 오류가 발생했습니다." });
    }
  }
);

module.exports = router;
