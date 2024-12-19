const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    res.render('index');
});

router.get('/daily', function(req, res) {
    res.render('daily');
});

module.exports = router;