const express = require("express");

const app = express();
app.use(express.json());

const { ObjectId } = require("mongodb");
const community = require("../models/community.model");

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
    const user = req.session.user;
    const posts = await community.getAllPost();

    for (const post of posts) {
      const comments = await community.getComments(post._id);

      post.shortContent =
        post.content.length > 30
          ? post.content.substring(0, 30) + "..."
          : post.content;
      post.timeAgo = timeAgo(post.time);
      post.commentCount = comments.length;
      const postAuthorProfile = await community.getPostAuthor(post.author);
      post.authorProfile = postAuthorProfile.user_img;
    }

    res.render("posts/community", { posts, user });
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
    const postAuthorProfile = await community.getPostAuthor(post.author);
    post.authorProfile = postAuthorProfile.user_img;

    if (!post) {
      return res
        .status(404)
        .render("errors/404", { message: "게시물을 찾을 수 없습니다." });
    }

    const comments = await community.getComments(new ObjectId(PostId));
    const commentCount = comments.length;
    post.timeAgo = timeAgo(post.time);

    for (const comment of comments) {
      comment.timeAgo = timeAgo(comment.time);
      const replies = await community.getReplyComments(comment._id);
      const replyCommentCount = replies.length;
      const commentAuthor = await community.getCommentAuthor(comment.author);
      const commentAuthorProfile = commentAuthor.user_img;

      for (const reply of replies) {
        const replyAuthor = await community.getReplyAuthor(comment.author);
        const replyAuthorProfile = replyAuthor.user_img;
        reply.timeAgo = timeAgo(reply.time);
        reply.authorProfile = replyAuthorProfile;
      }
      comment.replies = replies;
      comment.repliesCount = replyCommentCount;
      comment.authorProfile = commentAuthorProfile;
    }

    res.render("posts/community-detail", {
      post: post,
      comments: comments,
      commentCount: commentCount,
    });
  } catch (error) {
    console.error("에러 발생:", error);
    res.status(500).render("errors/500");
  }
}

function getInsertPost(req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>',
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

  try {
    await community.writePost(
      imgPaths,
      req.body.content,
      req.session.user.username,
      new Date(),
      req.session.user.id,
      0,
      0,
    );
    res.redirect("/community");
  } catch (error) {
    console.error("게시물 등록 오류 : \n", error);
    res.status(500).render("errors/500");
  }
}

async function Comment(req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>',
    );
  }

  const postId = req.params.id;
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ error: "댓글 내용을 입력하세요." });
  }

  const newComment = {
    postId: new ObjectId(postId),
    comment: comment,
    author: req.session.user.username,
    user_id: req.session.user.id,
    time: new Date(),
    authorProfile: req.session.user.profileImg,
  };

  try {
    const result = await community.writeComment(newComment);
    newComment._id = result.insertedId;

    res.status(201).json({
      _id: newComment._id,
      comment: newComment.comment,
      author: newComment.author,
      authorProfile:
        req.session.user.profileImg || "/images/default-profile.png",
      timeAgo: timeAgo(newComment.time),
    });
  } catch (error) {
    console.error("댓글 등록 오류 : ", error);
    res.status(500).json({ error: "서버 오류 발생" });
  }
}

async function ReplyComment(req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>',
    );
  }

  const commentId = req.params.id;
  const { replyComment } = req.body;

  if (!ObjectId.isValid(commentId)) {
    return res.status(400).json({ error: "잘못된 댓글 ID입니다." });
  }

  const newReplyComment = {
    commentId: new ObjectId(commentId),
    comment: replyComment,
    author: req.session.user.username,
    user_id: req.session.user.id,
    time: new Date(),
  };

  try {
    const result = await community.writeReplyComment(newReplyComment);
    newReplyComment._id = result.insertedId;

    res.status(201).json({
      _id: newReplyComment._id,
      comment: newReplyComment.comment,
      author: newReplyComment.author,
      authorProfile:
        req.session.user.profileImg || "/images/default-profile.png",
      timeAgo: timeAgo(newReplyComment.time),
    });
  } catch (error) {
    console.error("답글 등록 오류: ", error);
    res.status(500).json({ error: "서버 오류 발생" });
  }
}

module.exports = {
  getCommunity,
  getCommunityDetail,
  Comment,
  getInsertPost,
  InsertPost,
  ReplyComment,
};
