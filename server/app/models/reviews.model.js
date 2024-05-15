const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
    {
        reviewType: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        reviewContent: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        }
    },
    {timestamps: true}
);


module.exports = mongoose.model('Review', reviewSchema);
