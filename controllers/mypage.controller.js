const db = require("../data/database");
const express = require("express");

const app = express();
app.use(express.json());

const community = require("../models/community.model");
const mypage = require("../models/mypage.model");

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

// 🔥마이페이지🔥
async function getMypage(req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  try {
    const sessionUser = req.session.user;
    const sessionUserName = sessionUser.username;

    const user = await mypage.getUserByNickname(sessionUserName);

    const posts = await community.getPostByNickName(user.username);

    posts.forEach((post) => {
      if (post.content.length > 30) {
        post.shortContent = post.content.substring(0, 30) + "...";
      } else {
        post.shortContent = post.content;
      }
      post.timeAgo = timeAgo(post.time);
    });

    res.render("mypage/my-page", { user: user, posts: posts });
  } catch (error) {
    console.error("게시물 로드 중 오류:", error);
    res.status(500).render("errors/500");
  }
}

// 🔥프로필 사진 변경🔥
async function uploadProfileImg(req, res) {
  try {
    const sessionUser = req.session.user;
    const sessionUserName = sessionUser.username;
    const profileImgPath = `/uploads/${req.file.filename}`;

    mypage.uploadProfileImg(sessionUserName, profileImgPath);

    req.session.user.user_img = profileImgPath;
    return res.redirect("/my-page");
  } catch (error) {
    console.error("프로필 이미지 업데이트 중 오류 발생:", error);
    return res.render("/errors/404");
  }
}

// 🔥닉네임 수정 페이지🔥
async function getChangeNickname(req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }
  const sessionUser = req.session.user;
  const sessionUserName = sessionUser.username;

  const user = await mypage.getUserByNickname(sessionUserName);
  res.render("mypage/change-username", { user: user, message: "" });
}

// 🔥닉네임 수정🔥
async function changeNickname(req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  const sessionUser = req.session.user;
  const sessionUserName = sessionUser.username;

  const enteredUsername = req.body.username;
  const message = "";

  const user = await mypage.getUserByNickname(sessionUserName);

  const existingUser = await mypage.getUserByNickname(enteredUsername);

  if (existingUser) {
    return res.render("mypage/change-username", {
      user: user,
      message: "이미 사용 중인 닉네임입니다.",
    });
  }

  await mypage.changeUsername(sessionUserName, enteredUsername);

  await community.changePostAuthor(sessionUserName, enteredUsername);

  await community.changeCommentAuthor(sessionUserName, enteredUsername);

  sessionUser.username = enteredUsername;

  res.redirect("/my-page");
}

// 🔥이름 수정 페이지🔥
async function getChangeName(req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }
  const sessionUser = req.session.user;
  const sessionUserName = sessionUser.username;

  const user = await mypage.getUserByNickname(sessionUserName);

  res.render("mypage/change-name", { user: user });
}

// 🔥이름 수정🔥
async function changeName(req, res) {
  const sessionUser = req.session.user;
  const sessionUserName = sessionUser.name;
  const enteredName = req.body.name;

  await mypage.changeName(sessionUserName, enteredName);

  res.redirect("/my-page");
}

module.exports = {
  getMypage,
  uploadProfileImg,
  getChangeNickname,
  changeNickname,
  getChangeName,
  changeName,
};
