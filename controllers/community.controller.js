const express = require("express");

const app = express();
app.use(express.json());

const community = require('../models/community.model');

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

async function getCommunity(req, res) {
  try {
    const posts = await community.getAllPost();

    posts.forEach((post) => {
      if (post.content.length > 30) {
        post.shortContent = post.content.substring(0, 30) + "...";
      } else {
        post.shortContent = post.content;
      }
      post.timeAgo = timeAgo(post.time);
    });

    res.render("posts/community", { posts: posts });
  } catch (error) {
    console.error("게시물 로드 중 오류:", error);
    res.status(500).render("errors/500");
  }
}

async function getCommunityDetail(req, res) {
  const PostId = req.params.id;

  if (!ObjectId.isValid(PostId)) {
    return res.render("errors/404");
  }

  try {
    const post = await community.getOnePost(PostId);

    if (!post) {
      return res
        .status(404)
        .render("errors/404", { message: "게시물을 찾을 수 없습니다." });
    }

    const comments = await community.getCommunity();

    post.timeAgo = timeAgo(post.time);
    comments.forEach((comment) => {
      comment.timeAgo = timeAgo(comment.time);
    });

    res.render("posts/community-detail", {
      post: post,
      comments: comments,
      error: {},
    });
  } catch (error) {
    console.error("에러 발생:", error);
    res.status(500).render("errors/500");
  }
}

async function Comment(req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  const postId = req.params.id;
  const { comment } = req.body;

  const newComment = {
    postId: new ObjectId(postId),
    comment: comment,
    author: req.session.user.username,
    user_id: req.session.user,
    time: new Date(),
  };

  await community.writeComment(newComment);

  res.status(201).json({
    comment: newComment.comment,
    author: newComment.author,
    timeAgo: timeAgo(newComment.time),
  });
}

function getInsertPost(req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  res.render("posts/insert-post");
}

async function InsertPost(req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const imgPaths = [];
  ["img1", "img2", "img3", "img4", "img5"].forEach((key) => {
    if (req.files[key]) {
      imgPaths.push(`/uploads/posts/${req.files[key][0].filename}`);
    }
  });

  const post = {
    img: imgPaths,
    content: req.body.content,
    author: req.session.user.username,
    time: new Date(),
    user_id: req.session.user.id,
  };

  try {
    await community.writePost(post);
    console.log("게시물 삽입 성공:", post);
    res.redirect("/community");
  } catch (error) {
    console.error("게시물 등록 중 오류:", error);
    res.status(500).render("errors/500");
  }
}

module.exports = {
    getCommunity,
    getCommunityDetail,
    Comment,
    getInsertPost,
    InsertPost
};
