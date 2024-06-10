const Products = require("../models/products.model");
const Users = require("../models/users.model");
const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose');

exports.create = asyncHandler(async(req, res) => {
    // Validate request
    if (!req.body.name) {
        res.status(400).send({message: "Name field cannot be empty"})
        return;
    } else if (!req.body.category) {
        res.status(400).send({message: "Category field cannot be empty"})
        return;
    } else if (!req.body.manufacturer) {
      res.status(400).send({message: "Manufacturer field cannot be empty"})
      return;
    } else if (!req.body.image) {
      res.status(400).send({message: "Image field cannot be empty"})
      return;
    } else if (!req.body.specs) {
      res.status(400).send({message: "Specs field cannot be empty"})
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
                message: "Some error occurred while creating the Product."
            });
            return;
        });
});

// Find a single product with an id
exports.findOne = asyncHandler(async(req, res) => {
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
});

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

exports.searchProductsDB = asyncHandler(async(req, res) => {
    const queryString = req.query.search_query;
    await Products.find({name: {$regex: queryString, $options: 'i'}})
    .then(data => {
        if (!data) {
            res.status(404).send({
                message: "No products found matching: " + queryString });
            return;
        }
        extractedData = Products.find({
            '_id': {
                $in : data
            },
            },
            { _id: 1, name: 1, category: 1, image: 1 }
        ).sort({ name : 1 })
        .then(data => {
            res.status(200).send(data);
            return;
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Products from user " + username });
            return;
        });
    });

})



exports.deleteProduct = asyncHandler(async(req, res) => {
  const productId = mongoose.Types.ObjectId(req.params.productId);

  userData = await Products.findById(productId);

  // Delete the review from the reviews Database
  Products.findByIdAndDelete(productId)
      .then(product => {
          if (!product) {
              return res.status(404).send({
                  message: "Review not found with id " + productId
              });
          }

          // Remove the reference of the review from the product
          Users.updateMany(
            { products: { $in: product._id } },
            { $pull: { products: { $in: product._id } } }
          );

          res.status(200).send({ message: "Product deleted successfully!" });
      })
      .catch(err => {
          res.status(500).send({
              message: err.message || "Some error occurred while deleting the Review."
          });
      });
});


exports.deleteProduct = asyncHandler(async(req, res) => {
  const productId = mongoose.Types.ObjectId(req.params.productId);

  // Delete the product from the Product Database
  const deletedProductsUsers = await Users.updateMany(
    { products: productId },
    { $pull: { products: productId } })

  if (!deletedProductsUsers) {
      return res.status(404).send( { message: "Product not found with id " + productId });
    }

  Products.findByIdAndDelete(productId)
    .then(product => {
      if (!product) {
        return res.status(404).send( {message: "Review not found with id " + productId} );
      }
    });

  res.status(200).send({ message: "Product deleted successfully!" });
});


