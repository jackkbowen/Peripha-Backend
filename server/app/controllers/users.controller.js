const genPassword = require('../utils/password').genPassword;
const Users = require("../models/users.model");
const asyncHandler = require('express-async-handler')

// Create and Save a new Users
exports.create = asyncHandler(async(req, res) => {
    // Validate request
    if (!req.body.email) {
        res.status(400).send({message: "Email field cannot be empty"})
        return;
    } else if (!req.body.username) {
        res.status(400).send({message: "Username field cannot be empty"})
        return;
    } else if (!req.body.password) {
        res.status(400).send({message: "Password field cannot be empty"})
        return;
    } 

    // Check for existing user
    const userExists = await Users.findOne({$or: [{ email: req.body.email }, { username: req.body.username }]});
    //console.log(userExists);
        if (userExists) {
            res.status(409).send({message: "ERROR: User already exists. Please use a different username/password.", 
                                email: req.body.email});
            return;
        }

     // Generate hash and salt from password to be stored.
    const saltHash = genPassword(String(req.body.password));
    const genSalt = saltHash.salt;
    const genHash = saltHash.hash;


    // Create a new User
    const user = new Users({
        email: req.body.email,
        username: req.body.username,
        hash: genHash,
        profilePicture: "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
        salt: genSalt,
        products: [],
        displayName: req.body.username,
        bio: ""
    });

    // Save User in the database
    user
        .save(user)
        .then(data => {
            res.status(200).send(data);
            return;
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Users."
            });
            return
        });
});

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
    const email = req.query.email;
    var condition = email ? { email: { $regex: new RegExp(email), $options: "i" } } : {};

    Users.find(condition)
        .then(data => {
            res.status(200).send(data);
            return;
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Users."
            });
            return;
        });
};

// Check if email and password exists in the database
exports.checkInformation = (req, res) => {

    const query = Users.find({email: req.params['email']});
    query.getFilter();

    const results = query.exec();

    res.status(200).send(req.params['email']);
    return;
};

// Find a single User with an id
exports.findOne = (req, res) => {
    const id = req.params['id'];

    Users.findById(id)
        .then(data => {
            if (!data) {
                res.status(404).send({ 
                    message: "Not found Users with id " + id });
                return;
            }
            else res.status(200).send(data);;
            return;
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Users with id=" + id });
            return;
        });
};

// Find a single User by their username
exports.findUser = (req, res) => {
    const username = req.params.username;
    Users.findOne({username: username})
        .then(data => {
            if (!data) {
                res.status(404).send({ 
                    message: "Not found Users with id " + username });
                return;
            }
            else res.status(200).send(data);;
            return;
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Users with username=" + username });
            return;
        });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Users.findByIdAndRemove(id, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Users with id=${id}. Maybe Users was not found!`
                });
            } else {
                res.status(200).send({
                    message: "Users was deleted successfully!"
                });
            }
            return;
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Users with id=" + id
            });
            return;
        });
};
