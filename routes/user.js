const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const db = require("../data/database");
const { ObjectId } = require("mongodb");

router.get("/join", function (req, res) {
  res.render("join", { errors: {} });
});

router.post("/sign-up", async function (req, res) {
  const userData = req.body;
  const enteredId = userData.user_id || "";
  const enteredPw = userData.user_pw || "";
  const enteredConfirmPw = userData.user_pw_check || "";
  const enteredName = userData.user_name || "";

  const enteredUserName = userData.user_username;
  const enteredBirth = userData.user_birth;
  const enteredEmail = userData.user_email;
  const enteredHeight = userData.user_height;
  const enteredWeight = userData.user_weight;

  const existingUser = await db.getDb().collection("User").findOne({
    user_id: enteredId,
  });

  const errors = {};

  // 아이디 검사
  const userIdPattern = /^[a-z0-9]{4,16}$/;
  if (!enteredId) {
    errors.userId = "(아이디를 입력하세요)";
  } else if (!userIdPattern.test(enteredId)) {
    errors.userId = "(영소문자/숫자 4-16자만 가능합니다)";
  }

  // 비밀번호 검사
  const userPwPattern =
    /^(?=.*[a-zA-Z].*)(?=.*[0-9].*|.*[!@#$%^&*].*).*|(?=.*[0-9].*)(?=.*[!@#$%^&*].*).{8,16}$/;
  if (!enteredPw) {
    errors.userPw = "(비밀번호를 입력하세요)";
  } else if (!userPwPattern.test(enteredPw)) {
    errors.userPw = "(영문, 숫자, 특수문자 포함 8~16자로 입력하세요)";
  }

  // 비밀번호 확인 검사
  if (!enteredConfirmPw) {
    errors.userPwCheck = "(비밀번호를 확인해주세요)";
  } else if (enteredConfirmPw !== enteredPw) {
    errors.userPwCheck = "(비밀번호가 일치하지 않습니다)";
  }

  // 이름 검사
  if (!enteredName) {
    errors.userName = "(이름을 입력하세요)";
  }

  if (Object.keys(errors).length > 0) {
    return res.render("join", { errors });
  }

  const hashedPassword = await bcrypt.hash(String(enteredPw), 12);
  console.log("암호화된 비밀번호:", hashedPassword);

  const newUser = {
    id: enteredId,
    password: hashedPassword,
    name: enteredName,
    username: enteredUserName,
    birth: enteredBirth,
    email: enteredEmail,
    height: enteredHeight,
    weight: enteredWeight,
  };

  try {
    const result = await db.getDb().collection("User").insertOne(newUser);
    console.log("삽입 성공: ", newUser);
    res.redirect("/login");
  } catch (error) {
    console.error("추가 에러:", error);
    res.status(500).render("500");
  }
});

router.get("/login", function (req, res) {
  res.render("login", { errorId: "", errorPw: "" });
});

router.post("/login", async function (req, res) {
  const userData = req.body;
  const enteredId = userData.user_id;
  const enteredPw = userData.user_pw;

  const existingUser = await db
    .getDb()
    .collection("User")
    .findOne({ id: enteredId });

  if (!existingUser) {
    console.log("해당 유저가 존재하지 않습니다.");
    return res.render("login", {
      errorId: "해당 아이디가 존재하지 않습니다.",
      errorPw: "",
    });
  }

  const passwordsAreEqual = await bcrypt.compare(
    String(enteredPw),
    existingUser.password
  );

  if (!passwordsAreEqual) {
    console.log("비밀번호가 일치하지 않습니다");
    return res.render("login", {
      errorId: "",
      errorPw: "비밀번호가 일치하지 않습니다.",
    });
  }

  req.session.user = {
    id: existingUser._id.toString(),
    username: existingUser.username.toString(),
  };

  req.session.isAuthenticated = true;

  req.session.save((err) => {
    if (err) {
      console.error("세션 저장 에러 : ", err);
    }
    console.log("로그인 성공!");
    res.redirect("/");
  });
});

router.post("/logout", function (req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

router.get("/find-id", function (req, res) {
  res.render("find-id", { errors: {}, successMessage: null });
});

router.post("/find-id", async function (req, res) {
  const enteredName = req.body.user_name;
  const enteredUsername = req.body.user_username;

  const errors = {};

  if (!enteredName) {
    errors.nameError = "(이름을 입력하세요)";
  }

  if (!enteredUsername) {
    errors.usernameError = "(닉네임을 입력하세요)";
  }

  if (Object.keys(errors).length > 0) {
    return res.render("find-id", { errors, successMessage: null });
  }

  try {
    const existingUser = await db.getDb().collection("User").findOne({
      name: enteredName,
      username: enteredUsername,
    });

    if (!existingUser) {
      return res.render("find-id", {
        errors: {
          resultError: "해당 이름과 닉네임에 일치하는 사용자가 없습니다.",
        },
        successMessage: null,
      });
    }

    res.render("find-id", {
      successMessage: `아이디는 ${existingUser.id} 입니다.`,
      errors: {},
    });
  } catch (error) {
    console.error("아이디 찾기 중 오류:", error);
    res.status(500).render("500");
  }
});

router.get("/find-pw", function (req, res) {
  const userId = req.query.userId || null;
  const changePwVisible = !!userId;
  res.render("find-pw", {
    errors: {},
    successMessage: null,
    userId,
    changePwVisible,
  });
});

router.post("/find-pw", async function (req, res) {
  const enteredId = req.body.user_id;
  const enteredName = req.body.user_name;
  const enteredUsername = req.body.user_username;

  const errors = {};

  if (!enteredId) {
    errors.idError = "(아이디를 입력하세요)";
  }

  if (!enteredName) {
    errors.nameError = "(이름을 입력하세요)";
  }

  if (!enteredUsername) {
    errors.usernameError = "(닉네임을 입력하세요)";
  }

  if (Object.keys(errors).length > 0) {
    return res.render("find-pw", {
      errors,
      successMessage: null,
      changePwVisible: false,
      userId: null,
    });
  }

  try {
    const existingUser = await db.getDb().collection("User").findOne({
      id: enteredId,
      name: enteredName,
      username: enteredUsername,
    });

    if (!existingUser) {
      return res.render("find-pw", {
        errors: { resultError: "해당 정보와 일치하는 사용자가 없습니다." },
        successMessage: null,
        changePwVisible: false,
        userId: null,
      });
    }

    res.render("find-pw", {
      errors: {},
      successMessage: null,
      changePwVisible: true,
      userId: existingUser._id,
    });
  } catch (error) {
    console.error("비밀번호 찾기 중 오류:", error);
    res.status(500).render("500");
  }
});

router.post("/change-pw/:id", async function (req, res) {
  const userId = req.params.id;
  const enteredPw = req.body.user_pw;
  const enteredPwCheck = req.body.user_check_pw;

  const errors = {};

  const pwPattern = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,16}$/;

  if (!enteredPw) {
    errors.pwError = "(비밀번호를 입력하세요)";
  } else if (!pwPattern.test(enteredPw)) {
    errors.pwError = "(영문, 숫자 포함 8~16자로 입력하세요)";
  }

  if (enteredPw !== enteredPwCheck) {
    errors.pwError = "(비밀번호가 일치하지 않습니다)";
  }

  if (Object.keys(errors).length > 0) {
    return res.render("find-pw", {
      errors,
      successMessage: null,
      changePwVisible: true,
      userId,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(String(enteredPw), 12);

    await db
      .getDb()
      .collection("User")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $set: { password: hashedPassword } }
      );

    console.log("비밀번호 변경 성공");
    res.redirect("/login");
  } catch (error) {
    console.error("비밀번호 변경 중 오류:", error);
    res.status(500).render("500");
  }
});

module.exports = router;
