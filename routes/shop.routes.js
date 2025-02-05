const express = require("express");
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true })); 


const multer = require("multer");
const path = require("path");

const shopController = require("../controllers/shop.controller");

const storage = multer.diskStorage({
    destination: "./public/images/products",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

router.get("/shop", shopController.getShop);
router.get("/product/:id", shopController.getProductDetail);

router.get("/cart", shopController.getCart);
router.post("/add-to-cart", shopController.AddToCart); // AJAX
router.post("/update-cart", shopController.updateCart);

router.get("/purchase", shopController.getPurchasePage);
router.post("/product-purchasehase", shopController.Purchase);

router.get("/upload-product", shopController.getUploadProduct);
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
    shopController.UploadProduct
);

module.exports = router;