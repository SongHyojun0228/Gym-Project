const express = require("express");
const app = express();
app.use(express.json());

const shop = require("../models/shop.model");

// 📌상점 페이지 함수
async function getShop(req, res) {
  const user = req.session.user;
  try {
    const products = await shop.getAllProducts();
    res.render("shop/shop", { products, user });
  } catch (error) {
    console.log("상점 페이지 오류\n", error);
    res.status(500).redirect("/error/500");
  }
}

// 📌상점 상세 페이지 함수
async function getProductDetail(req, res) {
  const user = req.session.user;
  const productId = req.params.id;
  try {
    const product = await shop.getProduct(productId);
    console.log(product);
    res.render("shop/product_detail", { product, user });
  } catch(error) {
    console.log("상품 상세 페이지 오류\n", error);
    res.status(500).redirect("/error/500");
  }
}

// 📌장바구니 페이지 함수
function getCart(req, res) {
  res.render("shop/cart");
}

// 📌상품 추가 페이지 함수
function getUploadProduct(req, res) {
  res.render("shop/upload-product");
}

// 📌상품 추가 함수
async function UploadProduct(req, res) {
  if (!req.session.user && !req.session.user.isAdmin) {
    return res.redirect('/shop');
  }

  const imgPaths = [];
  ["product_main_img", "product_img1", "product_img2", "product_img3", "product_img4", "product_img5"]
    .forEach((key) => {
      if (req.files[key]) {
        imgPaths.push(`/images/products/${req.files[key][0].filename}`);
      }
    });

  try {
    await shop.uploadProduct(
      imgPaths,
      req.body.product_name,
      req.body.product_color,
      +req.body.product_price,
      req.body.product_detail,
      +0
    );
    res.redirect("/shop");
  } catch (error) {
    console.error("상품 추가 오류 : \n", error);
    res.status(500).render("errors/500");
  }
}

// 📌상품 장바구니 페이지 함수
async function getAddToCart() {

}

// 📌상품 장바구니 담기 함수
async function AddToCart() {

}

// 📌상품 구매 페이지 함수
async function getPurchasePage() {

}

// 📌상품 구매 함수
async function Purchase() {

}

module.exports = {
  getShop,
  getProductDetail,
  getCart,
  getUploadProduct,
  UploadProduct,
  getAddToCart,
  AddToCart,
  getPurchasePage,
  Purchase
};
