module.exports = app => {
    const reviews = require("../controllers/reviews.controller.js");
    const router = require("express").Router();
    const { verifyUserAccessAnyUser, verifyUserAccess } = require('../utils/password');

    // Add a review to a product
    router.post("/:productId", verifyUserAccessAnyUser, reviews.addReview);

    // Delete a review from a product
    router.delete("/:productId/:reviewId/", verifyUserAccess, reviews.deleteReview);

    // Update a review of a product
    router.put("/:reviewId/", verifyUserAccess, reviews.updateReview);

    // Get the contents of a review
    router.get("/:reviewId/", reviews.findReview);

    // Get all reviews of a product
    router.get("/productId/:productId/", reviews.getAllReviews);

    app.use("/reviews", router);
};
    
