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
      likes: [],
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

  static async changeReplyAuthor(nickname, changename) {
    await db
      .getDb()
      .collection("replies")
      .updateMany({ author: nickname }, { $set: { author: changename } });
  }

  static async getComments(postid) {
    const comments = await db
      .getDb()
      .collection("comments")
      .find({ postId: postid })
      .sort({ time: 1 })
      .toArray();

    return comments;
  }

  static async writeComment(newComment) {
    const result = await db
      .getDb()
      .collection("comments")
      .insertOne(newComment);
    return result;
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
    const result = await db
      .getDb()
      .collection("replies")
      .insertOne(newReplyComment);
    return result;
  }

  static async getPostAuthor(a) {
    const postAuthor = await db
      .getDb()
      .collection("posts")
      .findOne({ author: a });

    const Author = await db
      .getDb()
      .collection("users")
      .findOne({ username: postAuthor.author });
    return Author;
  }

  static async getCommentAuthor(a) {
    const commentAuthor = await db
      .getDb()
      .collection("comments")
      .findOne({ author: a });
    const Author = await db
      .getDb()
      .collection("users")
      .findOne({ username: commentAuthor.author });

    return Author;
  }

  static async getReplyAuthor(a) {
    const replyAuthor = await db
      .getDb()
      .collection("replies")
      .findOne({ author: a });

    const authorName = replyAuthor.author;

    const Author = await db
      .getDb()
      .collection("users")
      .findOne({ username: authorName });

    return Author;
  }

  static async updateLike(postId, username) {
    const post = await db.getDb().collection("posts").findOne({ _id: new ObjectId(postId) });

    if (!post) return null;

    // likes 필드가 존재하지 않거나 배열이 아닐 경우 초기화
    if (!Array.isArray(post.likes)) {
      post.likes = []; // 배열로 초기화
    }

    let updateQuery;
    let isLiked = false;
    let updatedLikeCount = post.like || 0; // null일 경우 0으로 초기화

    if (post.likes.includes(username)) {
      // 이미 좋아요를 누른 경우 → 취소
      updateQuery = { $pull: { likes: username }, $inc: { like: -1 } };
      updatedLikeCount -= 1;
    } else {
      // 좋아요 추가
      updateQuery = { $push: { likes: username }, $inc: { like: 1 } };
      updatedLikeCount += 1;
      isLiked = true;
    }

    await db.getDb().collection("posts").updateOne(
      { _id: new ObjectId(postId) },
      updateQuery
    );

    return { like: updatedLikeCount, isLiked };
  }
}

module.exports = Community;
