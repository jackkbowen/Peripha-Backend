const Products = require("../models/products.model");
const Reviews = require("../models/reviews.model");
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// Create a review

exports.addReview = asyncHandler(async(req, res) => {
    const productId = mongoose.Types.ObjectId(req.params.productId);

    // Create a new Review object
    // req.params.username is being set from verifyUserAccessAnyUser.
    // Takes the username from the currently signed in user.
    const newReview = new Reviews({
        reviewType: req.body.reviewType,
        username: req.params.username,
        reviewContent: req.body.reviewContent,
        rating: req.body.rating
    });

    // Add the review to the reviews Database
    newReview
        .save(newReview)
        .then(data => {
            res.status(200).send(data);
            return;
        })
        .catch(err => {
            res.status(500).send({
                message: "Some error occurred while creating the Review." + err
            });
            return
        });

    // Link the Review to the associated product
    // One (product) to Many (reviews) relationship
    Products.updateMany( { _id: productId },
        {
            $push: {reviews: newReview },
            $currentDate: { lastModified: true }
        },
    ).catch (err => {
        return res.status(400).send({ message: "Error occurred while adding a review to product: " + productId + " Error: " + err });

    });
    return
});


// Delete a review

exports.deleteReview = asyncHandler(async(req, res) => {
    const reviewId = mongoose.Types.ObjectId(req.params.reviewId);
    const productId = mongoose.Types.ObjectId(req.params.productId);

    // Delete the review from the reviews Database
    Reviews.findByIdAndDelete(reviewId)
        .then(review => {
            if (!review) {
                return res.status(404).send({
                    message: "Review not found with id " + reviewId
                });
            }

            // Remove the reference of the review from the product
            Products.updateMany(
                { _id: productId },
                { $pull: { reviews: reviewId } }
            );

            res.status(200).send({ message: "Review deleted successfully!" });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while deleting the Review."
            });
        });
});


// Update a review

exports.updateReview = asyncHandler(async(req, res) => {
    const reviewId = mongoose.Types.ObjectId(req.params.reviewId);
    console.log("In update")

    // Update the review in the reviews Database
    Reviews.findByIdAndUpdate(
        reviewId,
        {
            reviewType: req.body.reviewType,
            username: req.body.username,
            reviewContent: req.body.reviewContent,
            rating: req.body.rating
        },
        { new: true }
    )
    .then(review => {
        if (!review) {
            return res.status(404).send({
                message: "Review not found with id " + reviewId
            });
        }
        res.status(200).send(review);
    })
    .catch(err => {
        res.status(500).send({
            message: "Some error occurred while updating the Review."
        });
    });
});

// Retrieve all reviews
exports.findReview = asyncHandler(async(req, res) => {
    const reviewId = mongoose.Types.ObjectId(req.params.reviewId);

    // Find the review by ID
    Reviews.findById(reviewId)
        .then(review => {
            if (!review) {
                return res.status(404).send({
                    message: "Review not found with id " + reviewId
                });
            }
            res.status(200).send(review);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving the Review."
            });
        });
});

// Retrieve all reviews
exports.getAllReviews = asyncHandler(async(req, res) => {
    const productId = req.params.productId;
    let reviews = [];
    await Products.findById(productId)
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: "No Product with id " + productId });
                return;
            }
            reviews = data.reviews;
            Reviews.find({
                '_id': {
                    $in : reviews
                }
            }).then(data => {
                res.status(200).send(data);
                return;
            })
            .catch(err => {
                res.status(500).send({
                    message: "Error retrieving Reviews from product " + productId });
                return;
            });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving product with Id" + productId });
            return;
        });
});

