const db = require("../data/database");
const { ObjectId } = require("mongodb");

class Shop {
    static async uploadProduct(img, name, content, likes) {
        const product = {
            img: img,
            name: name,
            content: content,
            likes: likes
        };
        console.log("상품 추가 : \n", product);
        await db.getDb().collection("products").insertOne(product);
    }
}

module.exports = Shop;