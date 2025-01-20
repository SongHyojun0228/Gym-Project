const db = require("../data/database");

async function getMypage(req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  const sessionUser = req.session.user;

  const user = await db
    .getDb()
    .collection("users")
    .findOne({ username: sessionUser.username });
  console.log(user);

  res.render("mypage/my-page", { user: user });
}

async function uploadProfileImg(req, res) {
  try {
    const sessionUser = req.session.user;
    const profileImgPath = `/uploads/${req.file.filename}`;

    await db
      .getDb()
      .collection("users")
      .updateOne(
        { username: sessionUser.username },
        { $set: { user_img: profileImgPath } }
      );

    req.session.user.user_img = profileImgPath;

    return res.redirect("/my-page");
  } catch (error) {
    console.error("프로필 이미지 업데이트 중 오류 발생:", error);
    return res.render("/errors/404");
  }
}

// 닉네임 수정
async function getChangeNickname(req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }
  const sessionUser = req.session.user;

  const user = await db
    .getDb()
    .collection("users")
    .findOne({ username: sessionUser.username });
  console.log(user);
  res.render("mypage/change-username", { user: user, message: "" });
}

async function changeNickname(req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  const sessionUser = req.session.user;
  const enteredUsername = req.body.username;
  const message = "";

  const user = await db
    .getDb()
    .collection("users")
    .findOne({ username: sessionUser.username });

  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ username: enteredUsername });

  if (existingUser) {
    return res.render("mypage/change-username", {
      user: user,
      message: "이미 사용 중인 닉네임입니다.",
    });
  }

  await db
    .getDb()
    .collection("users")
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

  res.redirect("/my-page");
}

// 이름 수정
async function getChangeName(req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }
  const sessionUser = req.session.user;

  const user = await db
    .getDb()
    .collection("users")
    .findOne({ username: sessionUser.username });
  console.log(user);
  res.render("mypage/change-name", { user: user });
}

async function changeName(req, res) {
  const sessionUser = req.session.user;
  const enteredName = req.body.name;

  const user = await db
    .getDb()
    .collection("users")
    .findOne({ username: sessionUser.username });

  await db
    .getDb()
    .collection("users")
    .updateOne(
      { username: sessionUser.username },
      { $set: { name: enteredName } }
    );

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
