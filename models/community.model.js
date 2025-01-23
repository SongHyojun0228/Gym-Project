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

  static async getPostByNickName(nickname) {
    const post = await db
      .getDb()
      .collection("posts")
      .find({ author: nickname })
      .sort({ time: -1 })
      .toArray();

    return post;
  }

  static async getOnePost(postid) {
    const post = await db
      .getDb()
      .collection("posts")
      .findOne({ _id: new ObjectId(postid) });

    return post;
  }

  static async writePost(img, content, author, time, id, like, hate) {
    const post = {
      img: img,
      content: content,
      author: author,
      time: time,
      user_id: id,
      like: like,
      hate: hate,
    };
    console.log("게시물 삽입 : \n", post);
    await db.getDb().collection("posts").insertOne(post);
  }

  static async changePostAuthor(nickname, changename) {
    await db
      .getDb()
      .collection("posts")
      .updateMany({ author: nickname }, { $set: { author: changename } });
  }

  static async changeCommentAuthor(nickname, changename) {
    await db
      .getDb()
      .collection("comments")
      .updateMany({ author: nickname }, { $set: { author: changename } });
  }

  static async getComments(postid) {
    const comments = await db
      .getDb()
      .collection("comments")
      .find({ postId: postid})
      .toArray();

    return comments;
  }

  static async writeComment(newComment) {
    await db.getDb().collection("comments").insertOne(newComment);
  }

  static async getReplyComments(commentId) {
    const replies = await db
      .getDb()
      .collection("replies")
      .find({ commentId: commentId })
      .toArray();

    return replies;
  }

  static async writeReplyComment(newReplyComment) {
    await db.getDb().collection("replies").insertOne(newReplyComment);
  }
}

module.exports = Community;
