module.exports = app => {
    const reviews = require("../controllers/reviews.controller.js");

    var router = require("express").Router();

    // Add a review to a product
    router.post("/:productId", reviews.addReview);

    // Delete a review from a product
    router.delete("/:productId/:reviewId/", reviews.deleteReview);

    // Update a review of a product
    router.put("/:reviewId/", reviews.updateReview);

    // Get the contents of a review
    router.get("/:reviewId/", reviews.findReview);

    // Get all reviews of a product
    router.get("/productId/:productId/", reviews.getAllReviews);

    app.use("/reviews", router);
};
    
