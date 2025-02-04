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
    return res.redirect("/shop");
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
async function getCart(req, res) {
  const cart_items = req.session.cart; 
  req.session.cart.totalPrice = 0;
  req.session.cart.totalAmount = req.session.cart.length;
  for(const cart_item of cart_items) {
    req.session.cart.totalPrice += cart_item.product_price;
  }

  res.render("shop/cart", { cart_items });
}

// 📌상품 장바구니 담기 함수
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
    };

    req.session.cart = req.session.cart || [];
    req.session.cart.push(cart);
    res.json({ success: true });
  } catch (error) {
    console.log("장바구니 담기 중 오류 : \n", error);
    res.status(500).json({ success: false, message: "서버 오류 발생" });
  }
}


// 📌상품 구매 페이지 함수
async function getPurchasePage(req, res) {
  res.render("shop/purchase")
}

// 📌상품 구매 함수
async function Purchase(req, res) {

}

module.exports = {
  getShop,
  getProductDetail,
  getCart,
  getUploadProduct,
  UploadProduct,
  getCart,
  AddToCart,
  getPurchasePage,
  Purchase
};
