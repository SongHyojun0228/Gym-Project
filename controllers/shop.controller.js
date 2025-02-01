const express = require("express");
const app = express();
app.use(express.json());

const { ObjectId } = require("mongodb");

const shop = require("../models/shop.model");

function getShop(req, res) {
  res.render("shop/shop");
}

function getCart(req, res) {
  res.render("shop/cart");
}

function getUploadProduct(req, res) {
  res.render("shop/upload-product");
}

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
  getCart,
  getUploadProduct,
  UploadProduct
};
