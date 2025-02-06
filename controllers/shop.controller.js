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
function getCart(req, res) {
  req.session.cart = req.session.cart || [];
  const cart_items = req.session.cart;
  const cartTotalAmount = req.session.cartTotalAmount;
  const cartTotalPrice = req.session.cartTotalPrice;

  res.render("shop/cart", { cart_items, cartTotalAmount, cartTotalPrice });
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

    // ✅ 만약 로그인이 되어있는 상태라면? ✅
    const user = req.session.user;
    if (user) {
      const userCart = await shop.loadCart(user.username);
      let userIsIncluded = false;
      for (const userCartProducts of userCart) {
        // ✅ 동일 상품을 담았을 때 ✅
        if (userCartProducts.productId === cart.productId) {
          console.log("동일 상품 추가");
          await shop.addSameProduct(user.username, userCartProducts.productId, userCartProducts.product_price);
          userIsIncluded = true;
        }
      }

      // ✅ 다른 상품을 담았을 때 ✅
      if (!userIsIncluded) {
        await shop.addToCart(product, user.username);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.log("장바구니 담기 중 오류 : \n", error);
    res.status(500).json({ success: false, message: "서버 오류 발생" });
  }
}

// 📌상품 장바구니 수정 함수
async function updateCart(req, res) {
  const { productId, amount } = req.body;

  if (!productId || isNaN(amount) || amount < 1) {
    return res.status(400).json({ success: false, message: "잘못된 요청입니다." });
  }

  try {
    let updatedPrice = 0;
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

    res.json({
      success: true,
      cartTotalAmount: req.session.cartTotalAmount,
      totalPrice: req.session.cartTotalPrice,
      updatedPrice // 개별 상품의 변경된 총 가격 반환
    });
  } catch (error) {
    console.error("장바구니 수량 업데이트 오류:", error);
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
  updateCart,
  getPurchasePage,
  Purchase
};
