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
      const postId = post._id.toString();
      const comments = await community.getComments(postId);

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
  const user = req.session.user;
  const PostId = req.params.id;
  if (!ObjectId.isValid(PostId)) {
    return res.render("errors/404");
  }

  try {
    const post = await community.getOnePost(PostId);
    console.log("✅ 게시물 자세히 보기 : ", PostId);
    const postAuthorProfile = await community.getPostAuthor(post.author);
    post.authorProfile = postAuthorProfile.user_img;

    if (!post) {
      return res
        .status(404)
        .render("errors/404", { message: "게시물을 찾을 수 없습니다." });
    }

    const comments = await community.getComments(PostId);
    const commentCount = comments.length;
    post.timeAgo = timeAgo(post.time);

    for (const comment of comments) {

      comment.timeAgo = timeAgo(comment.time);

      const commentId = comment._id.toString();
      const replies = await community.getReplyComments(commentId);
      const replyCommentCount = replies.length;
      const commentAuthor = await community.getCommentAuthor(comment.author);
      const commentAuthorProfile = commentAuthor.user_img;

      for (const reply of replies) {
        const replyAuthor = await community.getReplyAuthor(reply.author);
        const replyAuthorProfile = replyAuthor.user_img;
        reply.timeAgo = timeAgo(reply.time);
        reply.authorProfile = replyAuthorProfile;
      }
      comment.replies = replies;
      comment.repliesCount = replyCommentCount;
      comment.authorProfile = commentAuthorProfile;
    }


    if (!Array.isArray(post.likes)) {
      post.likes = [];
    }

    res.render("posts/community-detail", {
      user: user,
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

  if (!req.session.user.isAdmin) {
    return res.send(
      '<script>alert("글쓰기 권한이 없습니다."); window.location.href = "/community";</script>',
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
  const { comment } = req.body;
  const postId = req.params.id;
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ error: "로그인이 필요합니다.", redirect: "/login" });
  }

  if (!comment || !postId || !ObjectId.isValid(postId)) {
    console.error("❌ 잘못된 요청: postId가 유효하지 않거나 comment가 없음");
    return res.status(400).json({ error: "잘못된 요청입니다." });
  }

  const authorProfile = user.profileImg || "/images/basic-profiles/default-profile.png";

  const newComment = {
    postId: postId,
    comment: comment,
    author: user.username,
    authorProfile: authorProfile,
    time: new Date(),
  };

  try {
    const result = await community.writeComment(newComment);
    newComment._id = result.insertedId;
    newComment.timeAgo = timeAgo(newComment.time);
    res.json(newComment);
  } catch (error) {
    console.error("❌ 댓글 저장 중 오류 발생:", error);
    res.status(500).json({ error: "댓글 저장 중 오류가 발생했습니다." });
  }
}


async function ReplyComment(req, res) {
  const { replyComment } = req.body;
  const commentId = req.params.id;
  console.log("📢 저장하는 commentId:", commentId);

  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ error: "로그인이 필요합니다.", redirect: "/login" });
  }

  if (!replyComment) {
    console.error("❌ 잘못된 요청: replyComment가 없음");
    return res.status(400).json({ error: "잘못된 요청입니다." });
  }

  const authorProfile = user.profileImg || "/images/basic-profiles/default-profile.png"; // ✅ 기본 프로필 이미지 설정

  const newReply = {
    commentId: commentId,
    comment: replyComment,
    author: user.username,
    authorProfile: authorProfile,
    time: new Date(),
  };

  try {
    const result = await community.writeReplyComment(newReply);
    newReply._id = result.insertedId;
    newReply.timeAgo = timeAgo(newReply.time);
    res.json(newReply);
  } catch (error) {
    console.error("❌ 답글 작성 오류:", error);
    res.status(500).json({ error: "답글 저장 중 오류가 발생했습니다." });
  }
}



async function ClickCPostLike(req, res) {
  const user = req.session.user;
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "로그인이 필요합니다.", redirect: "/login" });
  }

  const username = user.username;
  const postId = req.params.id;

  try {
    const updatedData = await community.updateLike(postId, username);
    if (!updatedData) {
      return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
    }

    res.json(updatedData);
  } catch (error) {
    console.error("좋아요 처리 중 오류:", error);
    res.status(500).json({ error: "좋아요 업데이트 실패" });
  }
};


module.exports = {
  getCommunity,
  getCommunityDetail,
  Comment,
  getInsertPost,
  InsertPost,
  ReplyComment,
  ClickCPostLike
};