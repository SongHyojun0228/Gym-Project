const db = require("../data/database");
const { ObjectId } = require("mongodb");

class Shop {
    static async getAllProducts() {
        const products = db.getDb().collection("products").find().toArray();
        return products;
    }

    static async getProduct(productId) {
        const product = await db
            .getDb()
            .collection("products")
            .findOne({ _id: new ObjectId(productId) });
        return product;
    }

    static async uploadProduct(img, name, color, price, content, likes) {
        const product = {
            product_img: img,
            product_name: name,
            product_color: color,
            product_price: price,
            product_detail: content,
            likes: likes
        };
        console.log("상품 추가 : \n", product);
        await db.getDb().collection("products").insertOne(product);
    }

    static async loadCart(username) {
        const user = await db.getDb().collection("users").findOne({ username: username });
        return user.cart;
    }

    static async addToCart(cart, username) {
        await db.getDb().collection("users").updateOne(
            { username: username },
            {
                $push: {
                    "cart": cart
                }
            });
    }

    static async addSameProduct(username, productId, product_price) {
        await db.getDb().collection("users").updateOne(
            {
                username: username,
                "cart.productId": productId
            },
            {
                $inc: {
                    "cart.$.product_amount": 1,
                    "cart.$.product_price": product_price
                }
            }
        );
    }

    static async updateCartItem(username, productId, amount) {
        const user = await db.getDb().collection("users").findOne({ username: username });
        if (!user || !user.cart) return;

        const product = user.cart.find(item => item.productId === productId);
        if (!product) return;

        const unitPrice = product.product_price / product.product_amount; // 개당 가격 계산
        const newPrice = unitPrice * amount; // 새로운 총 가격 계산

        await db.getDb().collection("users").updateOne(
            { username: username, "cart.productId": productId },
            {
                $set: {
                    "cart.$.product_amount": amount,
                    "cart.$.product_price": newPrice
                }
            }
        );
    }

    static async deleteSessionCartProduct(sessionId, productId) {
        await db.getDb().collection("sessions").updateOne(
            { _id: sessionId },
            { $pull: { "session.cart": { productId: productId } } }
        );
    }

    static async deleteUserCartProduct(username, productId) {
        await db.getDb().collection("users").updateOne(
            { username: username },
            { $pull: { cart: { productId: productId } } }
        );
    }

    static async savePayment(orderId, user, cartItems, address, phone) {
        const today = new Date();
        const formattedDate = today.toLocaleDateString("ko-KR").replace(/-/g, ".");

        const paymentData = {
            orderId: orderId,
            user: {
                name: user.name,
                username: user.username,
                address: address,
                phone: phone,
                address : address
            },
            items: cartItems.map(item => ({
                productId: item.productId,
                product_img: item.product_img,
                product_name: item.product_name,
                product_color: item.product_color,
                product_price: item.product_price,
                product_amount: item.product_amount
            })),
            totalAmount: cartItems.reduce((sum, item) => sum + item.product_amount, 0),
            totalPrice: cartItems.reduce((sum, item) => sum + item.product_price, 0),
            date: formattedDate
        };

        await db.getDb().collection("payments").insertOne(paymentData);
    }

    static async clearUserCart(username) {
        await db.getDb().collection("users").updateOne(
            { username: username },
            { $set: { cart: [] } }
        );
    }

}

module.exports = Shop;