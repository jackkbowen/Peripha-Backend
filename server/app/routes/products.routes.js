module.exports = app => {
    const product = require("../controllers/products.controller.js");

    var router = require("express").Router();

    // Create a new Product
    router.post("/", product.create);


    app.use("/products", router);
};
  