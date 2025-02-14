const db = require("../data/database");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

class Auth {
  static async findById(id) {
    return db.getDb().collection("users").findOne({
      id: id,
    });
  }

  static async findByNameAndUsername(name, username) {
    return db.getDb().collection("users").findOne({
      name: name,
      username: username,
    });
  }

  static async findByIdAndDetails(id, name, username) {
    return db.getDb().collection("users").findOne({
      id: id,
      name: name,
      username: username,
    });
  }

  static async update(id, pw) {
    const hashedPassword = await bcrypt.hash(String(pw), 12);
    await db
      .getDb()
      .collection("users")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { password: hashedPassword } },
      );
  }

  static async save(id, pw, name, tel, postcode, address, detailAddress, extraAddress, username, profileImg) {
    const hashedPassword = await bcrypt.hash(String(pw), 12);

    const newUser = {
      id: id,
      password: hashedPassword,
      name: name,
      tel: tel,
      totalAddress: {
        postcode,
        address,
        detailAddress,
        extraAddress
      },
      username: username,
      user_img: profileImg,
      cart: [],
    };

    await db.getDb().collection("users").insertOne(newUser);
  }
}

module.exports = Auth;
