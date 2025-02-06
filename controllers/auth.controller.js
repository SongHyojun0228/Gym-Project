const bcrypt = require("bcrypt");
const Auth = require("../models/auth.model");
const shop = require("../models/shop.model");

// 🔥회원가입 페이지🔥
function getSignup(req, res) {
  res.render("auth/join", { errors: {} });
}

const { printTokenResult } = require("../utils/send_sms");
const authTokens = {};

// 🔥전화번호 인증🔥
async function sendVerificationCode(req, res) {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: "전화번호를 입력하세요." });
  }

  const token = Math.floor(100000 + Math.random() * 900000).toString();
  authTokens[phone] = token;

  try {
    await printTokenResult(phone, token);
    res.status(200).json({ message: "인증번호가 발송되었습니다." });
  } catch (error) {
    console.error("SMS 발송 오류:", error);
    res.status(500).json({ message: "SMS 발송에 실패했습니다." });
  }
}

// 🔥인증코드 입력🔥
function verifyCode(req, res) {
  const { phone, code } = req.body;
  if (authTokens[phone] === code) {
    delete authTokens[phone]; // 인증 후 제거
    res.status(200).json({ message: "인증되었습니다." });
  } else {
    res.status(400).json({ message: "인증번호가 올바르지 않습니다." });
  }
}

// 🔥회원가입🔥
async function Signup(req, res) {
  const {
    user_id,
    user_pw,
    user_pw_check,
    user_name,
    user_phone,
    user_username,
    verification_code,
  } = req.body;

  const errors = {};

  // 아이디 검사
  const userIdPattern = /^[a-z0-9]{4,16}$/;
  if (!user_id) {
    errors.userId = "(아이디를 입력하세요)";
  } else if (!userIdPattern.test(user_id)) {
    errors.userId = "(영소문자/숫자 4-16자만 가능합니다)";
  }

  // 비밀번호 검사
  const userPwPattern =
    /^(?=.*[a-zA-Z].*)(?=.*[0-9].*|.*[!@#$%^&*].*).*|(?=.*[0-9].*)(?=.*[!@#$%^&*].*).{8,16}$/;
  if (!user_pw) {
    errors.userPw = "(비밀번호를 입력하세요)";
  } else if (!userPwPattern.test(user_pw)) {
    errors.userPw = "(영문, 숫자, 특수문자 포함 8~16자로 입력하세요)";
  }

  // 비밀번호 확인 검사
  if (!user_pw_check) {
    errors.userPwCheck = "(비밀번호를 확인해주세요)";
  } else if (user_pw_check !== user_pw) {
    errors.userPwCheck = "(비밀번호가 일치하지 않습니다)";
  }

  // 이름 검사
  if (!user_name) {
    errors.userName = "(이름을 입력하세요)";
  }

  // 전화번호 인증 확인
  if (!user_phone || !verification_code) {
    errors.phone = "(전화번호와 인증번호를 입력하세요)";
  } else if (authTokens[user_phone] !== verification_code) {
    errors.phone = "(인증번호가 올바르지 않습니다)";
  }

  if (Object.keys(errors).length > 0) {
    return res.render("auth/join", { errors });
  }

  const existingUser = await Auth.findById(user_id);
  if (existingUser) {
    errors.userId = "(해당 아이디의 유저가 존재합니다)";
    return res.render("auth/join", { errors });
  }

  const existingUsername = await Auth.findByNameAndUsername(
    user_name,
    user_username,
  );
  if (existingUsername) {
    errors.userUsername = "(해당 닉네임의 유저가 존재합니다)";
    return res.render("auth/join", { errors });
  }

  try {
    const newUser = new Auth(
      user_id,
      user_pw,
      user_name,
      user_phone,
      user_username,
    );

    const profileImg = "/images/basic-profiles/basic-profile1.jpg";

    await newUser.save(user_id, user_pw, user_name, user_phone, user_username, profileImg);

    delete authTokens[user_phone];

    console.log("회원가입 성공");
    res.redirect("/login");
  } catch (error) {
    console.error("회원가입 중 오류 발생:", error);
    res.status(500).render("errors/500");
  }
}

// 🔥로그인 페이지🔥
function getLogin(req, res) {
  res.render("auth/login", { errorId: "", errorPw: "" });
}

// 🔥로그인🔥
async function Login(req, res) {
  const userData = req.body;
  const enteredId = userData.user_id;
  const enteredPw = userData.user_pw;

  const existingUser = await Auth.findById(enteredId);

  if (!existingUser) {
    console.log("해당 유저가 존재하지 않습니다.");
    return res.render("auth/login", {
      errorId: "해당 아이디가 존재하지 않습니다.",
      errorPw: "",
    });
  }

  const passwordsAreEqual = await bcrypt.compare(
    String(enteredPw),
    existingUser.password,
  );

  if (!passwordsAreEqual) {
    console.log("비밀번호가 일치하지 않습니다");
    return res.render("auth/login", {
      errorId: "",
      errorPw: "비밀번호가 일치하지 않습니다.",
    });
  }

  req.session.user = {
    id: existingUser._id.toString(),
    username: existingUser.username.toString(),
    name: existingUser.name.toString(),
    profileImg: existingUser.user_img,
    isAdmin: existingUser.isAdmin,
  };
  req.session.isAuthenticated = true;

  req.session.cartTotalPrice = 0;
  req.session.cartTotalAmount = 0;

  const sessionCart = req.session.cart;
  const loadCart = await shop.loadCart(req.session.user.username);

  // ✅ 세션 장바구니와 유저 장바구니가 모두 비어있을 때 ✅
  if (!loadCart && !sessionCart) {
    console.log("✅ 세션 장바구니와 유저 장바구니가 모두 비어있을 때 ✅");
    console.log("유저 장바구니 : ", loadCart);
    console.log("세션 장바구니 : ", sessionCart);
    req.session.cart = [];
  }

  // ✅ 세션 장바구니가 차 있고 유저 장바구니가 비어있을 때 ✅
  else if (!loadCart && sessionCart) {
    console.log("✅ 세션 장바구니가 차 있고 유저 장바구니가 비어있을 때 ✅");
    console.log("유저 장바구니 : ", loadCart);
    console.log("세션 장바구니 : ", sessionCart);
    for(const cart_item of sessionCart) {
      await shop.addToCart(cart_item, req.session.user.username);
    }
  }

  // ✅ 세션 장바구니가 비어있고 유저 바구니가 차 있을 때 ✅
  else if (loadCart && !sessionCart) {
    console.log("✅ 세션 장바구니가 비어있고 유저 바구니가 차 있을 때 ✅");
    console.log("유저 장바구니 : ", loadCart);
    console.log("세션 장바구니 : ", sessionCart);
    req.session.cart = loadCart;
    for (const currentCartProducts of loadCart) {
      req.session.cartTotalPrice += currentCartProducts.product_price;
      req.session.cartTotalAmount += currentCartProducts.product_amount;
    }
  }

  // ✅ 세션 장바구니와 유저 바구니가 모두 차 있을 때 ✅
  else {
    console.log(" ✅ 세션 장바구니와 유저 바구니가 모두 차 있을 때 ✅");
    console.log("유저 장바구니 : ", loadCart);
    console.log("세션 장바구니 : ", sessionCart);
    for(const cart_item of sessionCart) {
      await shop.addToCart(cart_item, req.session.user.username);
    }
    req.session.cart = loadCart;
    for (const currentCartProducts of loadCart) {
      req.session.cartTotalPrice += currentCartProducts.product_price;
      req.session.cartTotalAmount += currentCartProducts.product_amount;
    }
  }

  req.session.save((err) => {
    if (err) {
      console.error("세션 저장 에러 : ", err);
    }
    console.log("로그인 성공!");
    res.redirect("/");
  });
}

// 🔥로그아웃
function Logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
}

// 🔥아이디찾기 페이지
function getFindId(req, res) {
  res.render("mypage/find-id", { errors: {}, successMessage: null });
}

// 🔥아이디 찾기
async function FindId(req, res) {
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
    return res.render("mypage/find-id", { errors, successMessage: null });
  }

  try {
    const existingUser = await Auth.findByNameAndUsername(
      enteredName,
      enteredUsername,
    );

    if (!existingUser) {
      return res.render("mypage/find-id", {
        errors: {
          resultError: "해당 이름과 닉네임에 일치하는 사용자가 없습니다.",
        },
        successMessage: null,
      });
    }

    res.render("mypage/find-id", {
      successMessage: `아이디는 ${existingUser.id} 입니다.`,
      errors: {},
    });
  } catch (error) {
    console.error("아이디 찾기 중 오류:", error);
    res.status(500).render("errors/500");
  }
}

function getFindPw(req, res) {
  const userId = req.query.userId || null;
  const changePwVisible = !!userId;
  res.render("mypage/find-pw", {
    errors: {},
    successMessage: null,
    userId,
    changePwVisible,
  });
}

async function FindPw(req, res) {
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
    return res.render("mypage/find-pw", {
      errors,
      successMessage: null,
      changePwVisible: false,
      userId: null,
    });
  }

  try {
    const existingUser = await Auth.findByIdAndDetails(
      enteredId,
      enteredName,
      enteredUsername,
    );

    if (!existingUser) {
      return res.render("mypage/find-pw", {
        errors: { resultError: "해당 정보와 일치하는 사용자가 없습니다." },
        successMessage: null,
        changePwVisible: false,
        userId: null,
      });
    }

    res.render("mypage/find-pw", {
      errors: {},
      successMessage: null,
      changePwVisible: true,
      userId: existingUser._id,
    });
  } catch (error) {
    console.error("비밀번호 찾기 중 오류:", error);
    res.status(500).render("errors/500");
  }
}

async function ChangePw(req, res) {
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
    return res.render("mypage/find-pw", {
      errors,
      successMessage: null,
      changePwVisible: true,
      userId,
    });
  }

  try {
    Auth.update(userId, enteredPw);

    console.log("비밀번호 변경 성공");
    res.redirect("/login");
  } catch (error) {
    console.error("비밀번호 변경 중 오류:", error);
    res.status(500).render("errors/500");
  }
}

module.exports = {
  sendVerificationCode,
  verifyCode,
  getSignup,
  Signup,
  getLogin,
  Login,
  Logout,
  getFindId,
  FindId,
  getFindPw,
  FindPw,
  ChangePw,
};
