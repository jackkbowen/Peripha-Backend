module.exports = app => {
    const product = require("../controllers/products.controller.js");

    var router = require("express").Router();

    // Create a new Product
    router.post("/", product.create);

    // Get a product by product ID
    router.get("/:productId", product.findOne);

    // Get multiple products based off of username
    router.get("/user/:username", product.findUserProducts);

    app.use("/products", router);
};
    
