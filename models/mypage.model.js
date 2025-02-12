const db = require("../data/database");

class Mypage {
  static async getUserByNickname(nickname) {
    const user = await db
      .getDb()
      .collection("users")
      .findOne({ username: nickname });

    return user;
  }

  static async uploadProfileImg(nickname, img) {
    await db
      .getDb()
      .collection("users")
      .updateOne({ username: nickname }, { $set: { user_img: img } });
  }

  static async uploadProfileImg(nickname, img) {
    await db
      .getDb()
      .collection("users")
      .updateOne({ username: nickname }, { $set: { user_img: img } });
  }

  static async changeUsername(nickname, changename) {
    await db
      .getDb()
      .collection("users")
      .updateOne({ username: nickname }, { $set: { username: changename } });
  }

  static async changeName(name, changename) {
    await db
      .getDb()
      .collection("users")
      .updateOne({ name: name }, { $set: { name: changename } });
  }

  static async loadUserPayments(username) {
    const payments = await db
      .getDb()
      .collection("payments")
      .find({"user.username" : username}).toArray();

    return payments;
  }

  static async loadUserPayments(username) {
    const payments = await db
      .getDb()
      .collection("payments")
      .find({"user.username" : username}).toArray();

    return payments;
  }
}

module.exports = Mypage;
