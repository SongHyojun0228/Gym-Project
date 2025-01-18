const express =  require('express');
const router = express.Router();

router.get('/shop', function(req, res) {
    res.render('shop/shop');
});

router.get('/cart', function(req, res) {
    res.render('shop/cart');
});

module.exports = router;