const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shop.controller");

router.get("/shop", shopController.getShop);

router.get("/cart", shopController.getCart);

router.get("/upload-product", shopController.getUploadProduct);

module.exports = router;
