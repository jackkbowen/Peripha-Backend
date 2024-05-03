const Products = require("../models/products.model");
const asyncHandler = require('express-async-handler')

exports.create = asyncHandler(async(req, res) => {
    // Validate request
    if (!req.body.name) {
        res.status(400).send({message: "Name field cannot be empty"})
        return;
    } else if (!req.body.category) {
        res.status(400).send({message: "Category field cannot be empty"})
        return;
    } 

    // Check for existing Product
    const productExists = await Products.findOne({ name: req.body.name });
        if (productExists) {
            res.status(409).send({message: "ERROR: Product already exists. Please use the existing product.", 
                                product: req.body.name});
            return;
        }

    // Create a new Product
    const product = new Products({
        name: req.body.name,
        category: req.body.category,
        manufacturer: req.body.manufacturer,
        model: req.body.model
    });

    // Save Product in the database
    product
        .save(product)
        .then(data => {
            res.status(200).send(data);
            return;
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Product."
            });
            return
        });
});