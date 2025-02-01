const db = require("../data/database");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

class Auth {
  constructor(id, pw, name, tel, username) {
    this.id = id;
    this.pw = pw;
    this.name = name;
    this.tel = tel;
    this.username = username;
  }

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

  async save(id, pw, name, tel, username) {
    const hashedPassword = await bcrypt.hash(String(pw), 12);

    const newUser = {
      id: id,
      password: hashedPassword,
      name: name,
      tel: tel,
      username: username,
    };

    await db.getDb().collection("users").insertOne(newUser);
  }
}

module.exports = Auth;
