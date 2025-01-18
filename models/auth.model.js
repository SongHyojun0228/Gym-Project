const db = require("../data/database");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

class Auth {
  constructor(id, pw, name, username, birth, email, height, weight) {
    this.id = id;
    this.pw = pw;
    this.name = name;
    this.username = username;
    this.birth = birth;
    this.email = email;
    this.height = height;
    this.weight = weight;
  }

  static async findById(id) {
    return db.getDb().collection("User").findOne({
      id: id,
    });
  }

  static async findByNameAndUsername(name, username) {
    return db.getDb().collection("User").findOne({
      name: name,
      username: username,
    });
  }

  static async findByIdAndDetails(id, name, username) {
    return db.getDb().collection("User").findOne({
      id: id,
      name: name,
      username: username,
    });
  }

  static async update(id, pw) {
    const hashedPassword = await bcrypt.hash(String(pw), 12);
    await db
      .getDb()
      .collection("User")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { password: hashedPassword } }
      );
  }

  async save(id, pw, name, username, birth, email, height, weight) {
    const hashedPassword = await bcrypt.hash(String(pw), 12);

    const newUser = {
      id: id,
      password: hashedPassword,
      name: name,
      username: username,
      birth: birth,
      email: email,
      height: height,
      weight: weight,
    };

    await db.getDb().collection("User").insertOne(newUser);
  }
}

module.exports = Auth;
