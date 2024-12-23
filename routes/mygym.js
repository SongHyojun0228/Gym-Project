const express = require("express");
const router = express.Router();
const db = require("../data/database");

const { ObjectId } = require("mongodb");

router.get("/mygym", async function (req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }

  const user = req.session.user.username;

  const gyms = await db
    .getDb()
    .collection("Daily")
    .find({ author: user })
    .sort({ date: -1 })
    .toArray();

  console.log(gyms);
  res.render("mygym", { gyms: gyms });
});

router.post("/mygym/:id/delete", async function (req, res) {
  const gymId = req.params.id;

  const result = await db
    .getDb()
    .collection("Daily")
    .deleteOne({ _id: new ObjectId(gymId) });

  res.status(200).json({ message: "Item deleted successfully" });
});

router.get("/mygym/:id", async function (req, res) {
  if (!req.session || !req.session.user) {
    return res.send(
      '<script>alert("로그인이 필요합니다."); window.location.href = "/login";</script>'
    );
  }
  const gymId = req.params.id;
  const gym = await db
    .getDb()
    .collection("Daily")
    .findOne({ _id: new ObjectId(gymId) });

  if (!gym) {
    return res.status(404).render("404");
  }

  res.render("mygym-detail", { gym: gym });
});

router.post("/mygym/:id/update", async function (req, res) {
  const gymId = req.params.id;
  const updatedContent = req.body.exercise_content;

  console.log("Gym ID:", gymId);
  console.log("Updated Content:", updatedContent);
  const result = await db
    .getDb()
    .collection("Daily")
    .updateOne(
      { _id: new ObjectId(gymId) },
      { $set: { exercise_content: updatedContent } }
    );

  res.redirect("/mygym/" + gymId);
});

module.exports = router;
