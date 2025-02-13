const express = require("express");
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));


const multer = require("multer");
const path = require("path");

const shopController = require("../controllers/shop.controller");
const cartController = require("../controllers/cart.controller");
const purchaseController = require("../controllers/purchase.controller");
const checkAuth = require("../utils/checkAuth");

const storage = multer.diskStorage({
    destination: "./public/images/products",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

router.get("/shop", shopController.getShop);
router.get("/product/:id", shopController.getProductDetail);
router.get("/upload-product", checkAuth.requireAdmin, shopController.getUploadProduct);
router.post(
    "/upload-product",
    upload.fields([
        { name: "product_main_img", maxCount: 1 },
        { name: "product_img1", maxCount: 1 },
        { name: "product_img2", maxCount: 1 },
        { name: "product_img3", maxCount: 1 },
        { name: "product_img4", maxCount: 1 },
        { name: "product_img5", maxCount: 1 },
    ]),
    checkAuth.requireAdmin,
    shopController.UploadProduct
);

router.get("/cart", cartController.getCart);
router.post("/add-to-cart", cartController.AddToCart);
router.post("/update-cart", cartController.updateCart);
router.post("/delete-cart-item", cartController.deleteCartProduct);

router.get("/purchase", checkAuth.requireLogin, purchaseController.getPurchasePage);
router.post("/payment-success", checkAuth.forceLogin, purchaseController.handlePaymentSuccess);
router.get("/success", checkAuth.forceLogin, purchaseController.getSuccess);
router.get("/fail", checkAuth.forceLogin, purchaseController.getFail);

module.exports = router;