const express = require("express");
const db = require("../data/database");
const router = express.Router();

router.get("/daily", function (req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  res.render("daily");
});

router.post("/insert-daily", async function (req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  const user = req.session.user;
  const newDaily = {
    muscles: req.body.muscle,
    exercise_content: req.body.text_gym,
    protein: req.body.protein,
    date: req.body.date,
    author: user.username,
  };

  try {
    const result = await db.getDb().collection("Daily").insertOne(newDaily);
    console.log("삽입 성공: ", newDaily);
    res.redirect("/mygym");
  } catch (error) {
    console.error("추가 에러:", error);
    res.status(500).render("500");
  }
});

module.exports = router;
