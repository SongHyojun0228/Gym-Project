const express = require("express");
const app = express();
app.use(express.json());

const { ObjectId } = require("mongodb");

function getShop(req, res) {
  res.render("shop/shop");
}

function getUploadProduct(req, res) {
  res.render("shop/upload-product");
}

function getCart(req, res) {
  res.render("shop/cart");
}

module.exports = {
  getShop,
  getUploadProduct,
  getCart,
};
