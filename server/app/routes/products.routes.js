module.exports = app => {
    const product = require("../controllers/products.controller.js");
    const router = require("express").Router();
    const { verifyUserAccessAnyUser, verifyUserAccess } = require('../utils/password');

    // Create a new Product
    router.post("/", product.create);

    // Get a product by product ID
    router.get("/:productId", product.findOne);

    // Get multiple products based off of username
    router.get("/user/:username", product.findUserProducts);

    // Get the search results based on the user entered query string
    router.get("/search/query", product.searchProductsDB);

    // Delete a product from the Products Database
    router.delete("/delete/:productId", product.deleteProduct);

    app.use("/products", router);
};

