const Products = require("../models/products.model");
const Users = require("../models/users.model");
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
        model: req.body.model,
        image: req.body.image,
        reviews: [],
        specs: req.body.specs
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

// Find a single product with an id
exports.findOne = (req, res) => {
    const id = req.params.productId;

    Products.findById(id)
        .then(data => {
            if (!data) {
                res.status(404).send({ 
                    message: "No Products found with id " + id });
                return;
            }
            else res.status(200).send(data);;
            return;
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Product with id=" + id });
            return;
        });
};

exports.findUserProducts = asyncHandler(async(req, res) => {
    const username = req.params.username;
    let products = [];
    await Users.findOne({username: username})
        .then(data => {
            if (!data) {
                res.status(404).send({ 
                    message: "Not found Users with id " + username });
                return;
            }
            products = data.products;
            Products.find({
                '_id': {
                    $in : products
                }
            }).then(data => {
                res.status(200).send(data);
                return;
            })
            .catch(err => {
                res.status(500).send({
                    message: "Error retrieving Products from user " + username });
                return;
            });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Users with username=" + username });
            return;
        });

    
});

exports.addReview = (req, res) => {
    const productId = req.params.productId;
    
    Products.updateMany( { _id: productId }, 
        {
            $set: {
                'reviews.$.reviewType': req.body.reviewType,
                'reviews.$.username': req.body.username,
                'reviews.$.reviewContent': req.body.reviewContent,
                'reviews.$.rating': req.body.rating
            },  
            $currentDate: { lastModified: true }
        },
        { upsert: true}
    ).catch (err => {
        return res.status(400).send({ message: "Error occurred while adding a review to product: " + productId + " Error: " + err });
            
    });
    return 
};
