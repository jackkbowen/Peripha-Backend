var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send('GET for the login page');


});

module.exports = router;