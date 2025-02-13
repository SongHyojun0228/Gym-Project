const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const shop = require("../models/shop.model");

// 📌상점 페이지 함수
async function getShop(req, res) {
  const user = req.session.user;
  try {
    const products = await shop.getAllProducts();
    res.render("shop/shop", { products, user });
  } catch (error) {
    console.log("상점 페이지 오류\n", error);
    res.status(500).redirect("/errors/500");
  }
}

// 📌상점 상세 페이지 함수
async function getProductDetail(req, res) {
  const user = req.session.user;
  const productId = req.params.id;
  try {
    const product = await shop.getProduct(productId);
    res.render("shop/product_detail", { product, user });
  } catch (error) {
    console.log("상품 상세 페이지 오류\n", error);
    res.status(500).redirect("/errors/500");
  }
}

// 📌상품 추가 페이지 함수
function getUploadProduct(req, res) {
  const user = req.session.user;
  if (!user || !user.isAdmin) {
    return res.send(checkAuth.isAdmin());
  }

  res.render("shop/upload-product");
}

// 📌상품 추가 함수
async function UploadProduct(req, res) {
  const user = req.session.user;
  if (!user || !user.isAdmin) {
    return res.send(checkAuth.isAdmin());
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

module.exports = {
  getShop,
  getProductDetail,
  getUploadProduct,
  UploadProduct,
};
