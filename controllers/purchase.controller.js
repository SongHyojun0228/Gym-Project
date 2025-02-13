const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const shop = require("../models/shop.model");

const checkAuth = require("../utils/checkAuth");

// 📌상품 구매 페이지 함수
async function getPurchasePage(req, res) {
    const user = req.session.user;
    if (!req.session || !user) {
        return res.send(checkAuth.checkLogin());
    }
    const userCart = await shop.loadCart(user.username);
    const totalPrice = req.session.cartTotalPrice;
    const totalAmount = req.session.cartTotalAmount;
    res.render("shop/purchase", { user: user, userCart: userCart, totalPrice: totalPrice, totalAmount: totalAmount });
}

// 📌결제 내역 저장 함수
async function handlePaymentSuccess(req, res) {
    const user = req.session.user;
    if (!req.session || !user) {
        return res.send(checkAuth.gotoLogin());
    }

    if (!req.body || Object.keys(req.body).length === 0) {
        console.error("❌ 요청 본문이 비어 있음!");
        return res.status(400).json({ error: "잘못된 요청입니다." });
    }

    const { orderId, address, phone } = req.body;

    if (!user) {
        console.error("❌ 사용자 세션 없음");
        return res.redirect("/shop");
    }

    try {
        console.log("💾 결제 데이터 저장 시도...");
        await shop.savePayment(orderId, user, req.session.cart || [], address, phone);
        console.log("✅ 결제 정보 저장 완료:", orderId);

        // ✅ 세션 장바구니 비우기
        req.session.cart = [];
        req.session.cartTotalAmount = 0;
        req.session.cartTotalPrice = 0;

        // ✅ 유저 장바구니 비우기 (DB 업데이트)
        await shop.clearUserCart(user.username);
        console.log("✅ 유저 장바구니 초기화 완료");

        res.redirect("/success");
    } catch (error) {
        console.error("❌ 결제 정보 저장 오류:", error);
        res.status(500).redirect("/fail");
    }
}

// 📌상품 구매 성공 페이지 함수
async function getSuccess(req, res) {
    const user = req.session.user;
    if (!req.session || !user) {
        return res.send(checkAuth.gotoLogin());
    }
    res.render("shop/success");
}

// 📌상품 구매 실패 페이지 함수
async function getFail(req, res) {
    const user = req.session.user;
    if (!req.session || !user) {
        return res.send(checkAuth.gotoLogin());
    }
    res.render("shop/fail");
}

module.exports = {
    getPurchasePage,
    handlePaymentSuccess,
    getSuccess,
    getFail
};
