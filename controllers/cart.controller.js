const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const shop = require("../models/shop.model");

// 📌 상품 장바구니 페이지 함수
function getCart(req, res) {
    req.session.cart = req.session.cart || [];
    const cart_items = req.session.cart;
    const cartTotalAmount = req.session.cartTotalAmount;
    const cartTotalPrice = req.session.cartTotalPrice;

    res.render("shop/cart", { cart_items, cartTotalAmount, cartTotalPrice });
}

// 📌 상품 장바구니 담기 함수
async function AddToCart(req, res) {
    const productId = req.body.productId;

    if (!productId) {
        return res.send(
            '<script>alert("해당 상품이 존재하지 않습니다."); window.location.href = "/shop";</script>',
        );
    }

    try {
        const product = await shop.getProduct(productId);
        if (!product) {
            return res.send(
                '<script>alert("해당 상품이 존재하지 않습니다."); window.location.href = "/shop";</script>',
            );
        }

        const cart = {
            productId: productId,
            product_img: product.product_img[0],
            product_price: product.product_price,
            product_name: product.product_name,
            product_color: product.product_color,
            product_amount: 1
        };

        req.session.cart = req.session.cart || [];
        req.session.cartTotalAmount = req.session.cartTotalAmount || 0;
        req.session.cartTotalPrice = req.session.cartTotalPrice || 0;

        req.session.cartTotalPrice += cart.product_price;
        req.session.cartTotalAmount += cart.product_amount;

        const currentCart = req.session.cart;
        let isIncluded = false;
        for (const currentCartProducts of currentCart) {
            if (currentCartProducts.productId === cart.productId) {
                currentCartProducts.product_amount++;
                currentCartProducts.product_price += cart.product_price;
                isIncluded = true;
            }
        }

        if (!isIncluded) {
            req.session.cart.push(cart);
        }

        // ✅ 만약 로그인이 되어있는 상태라면? 
        const user = req.session.user;
        if (user) {
            const userCart = await shop.loadCart(user.username);
            if (userCart) {
                let userIsIncluded = false;
                for (const userCartProducts of userCart) {
                    // ✅ 동일 상품을 담았을 때 
                    if (userCartProducts.productId === cart.productId) {
                        console.log("✅ 동일 상품 추가");
                        await shop.addSameProduct(user.username, userCartProducts.productId, userCartProducts.product_price);
                        userIsIncluded = true;
                    }
                }

                // ✅ 다른 상품을 담았을 때 
                if (!userIsIncluded) {
                    await shop.addToCart(cart, user.username);
                }
            }
            else {
                await shop.addToCart(cart, user.username);
            }
        }
        console.log("✅ 장바구니 담기 성공");
        res.json({ success: true });
    } catch (error) {
        console.log("❌ 장바구니 담기 중 오류 : \n", error);
        res.status(500).render("/errors/500");
    }
}

// 📌 상품 장바구니 수정 함수
async function updateCart(req, res) {
    const { productId, amount } = req.body;

    if (!productId || isNaN(amount) || amount < 1) {
        return res.status(400).json({ success: false, message: "잘못된 요청입니다." });
    }

    try {
        let updatedPrice = 0;

        // ✅ 세션 장바구니 업데이트
        req.session.cart.forEach(item => {
            if (item.productId === productId) {
                const unitPrice = item.product_price / item.product_amount; // 개당 가격 계산
                item.product_amount = amount;
                item.product_price = unitPrice * amount; // 새 총 가격 계산
                updatedPrice = item.product_price;
            }
        });

        req.session.cartTotalAmount = req.session.cart.reduce((sum, item) => sum + item.product_amount, 0);
        req.session.cartTotalPrice = req.session.cart.reduce((sum, item) => sum + item.product_price, 0);

        // ✅ 로그인한 유저의 장바구니 업데이트
        const user = req.session.user;
        if (user) {
            await shop.updateCartItem(user.username, productId, amount);
        }

        console.log("✅ 장바구니 수량 업데이트");
        res.json({
            success: true,
            cartTotalAmount: req.session.cartTotalAmount,
            totalPrice: req.session.cartTotalPrice,
            updatedPrice
        });
    } catch (error) {
        console.log("❌ 장바구니 수량 업데이트 오류:", error);
        res.status(500).render("/errors/500");
    }
}

// 📌  장바구니 상품 제거 함수
async function deleteCartProduct(req, res) {
    const productId = req.body.productId;

    if (!productId) {
        return res.status(400).json({ success: false, message: "상품 ID가 없습니다." });
    }

    try {
        // ✅ 세션 장바구니에서 삭제
        req.session.cart = req.session.cart.filter(item => item.productId !== productId);

        // ✅ 장바구니 개수와 총 가격을 다시 계산
        req.session.cartTotalAmount = req.session.cart.reduce((sum, item) => sum + item.product_amount, 0);
        req.session.cartTotalPrice = req.session.cart.reduce((sum, item) => sum + item.product_price, 0);

        // ✅ 로그인한 유저의 장바구니에서 삭제
        if (req.session.user) {
            await shop.deleteUserCartProduct(req.session.user.username, productId);
        }

        console.log("✅ 장바구니 상품 제거");
        res.json({
            success: true,
            cartTotalAmount: req.session.cartTotalAmount,
            totalPrice: req.session.cartTotalPrice
        });
    } catch (error) {
        console.log("❌ 장바구니 상품 삭제 중 오류 : \n", error);
        res.status(500).render("/errors/500");
    }
}

module.exports = {
    getCart,
    AddToCart,
    updateCart,
    deleteCartProduct,
};