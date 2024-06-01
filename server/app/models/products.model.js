const mongoose = require('mongoose');


const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        specs: {
            type: Object,
            required: true,
            default: {}
        },
        category: {
            type: String,
            required: true,
            unique: true
        },
        manufacturer: {
            type: String,
            required: true
        },
        model: {
            type: String,
            required: true
        },
        reviews: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Review'
      }],
        image: {
            type: String,
            required: true,
            default: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Question_Mark.svg/1200px-Question_Mark.svg.png"
        }
    },
    { timestamps: true, upsert: true }
);

module.exports = mongoose.model('Product', productSchema);
