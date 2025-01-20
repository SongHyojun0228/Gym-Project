const db = require("../data/database");
const { ObjectId } = require("mongodb");

class Community {
  static async getAllPost() {
    const posts = await db
      .getDb()
      .collection("posts")
      .find()
      .sort({ time: -1 })
      .toArray();
      
    return posts;
  }

  static async getOnePost(postid) {
    const post = await db
      .getDb()
      .collection("posts")
      .findOne({ _id: new ObjectId(postid) });

    return post;
  }

  static async writePost(post) {
    await db.getDb().collection("posts").insertOne(post);
  }

  static async getComments() {
    const comments = await db
      .getDb()
      .collection("comments")
      .find({ postId: new ObjectId(PostId) })
      .toArray();

    return comments;
  }

  static async writeComment(newComment) {
    await db.getDb().collection("comments").insertOne(newComment);
  }
}

module.exports = Community;
