var express = require('express');
var router = express.Router();
const user = require('../controllers/user.controller.js');


router.get('/', function(req, res, next) {
    res.send('GET for the login page');
});



module.exports = app => {
   router.post('/', user.create);

   app.use('/login', router);
}