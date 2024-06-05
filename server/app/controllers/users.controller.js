const User = require("../models/users.model");
const Blacklist = require("../models/blacklist.model");
const asyncHandler = require('express-async-handler')
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const { validPassword, genPassword, verifyJWT } = require('../utils/password');

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
    const userExists = await User.findOne({$or: [{ email: req.body.email }, { username: req.body.username }]});
    //console.log(userExists);
        if (userExists) {
            res.status(409).send({message: "ERROR: User already exists. Please use a different email or username.",
                                email: req.body.email});
            return;
        }

     // Generate hash and salt from password to be stored.
    const saltHash = genPassword(String(req.body.password));
    const genSalt = saltHash.salt;
    const genHash = saltHash.hash;

    // Create a new User
    const user = new User({
        email: req.body.email,
        username: req.body.username,
        hash: genHash,
        profilePicture: "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
        salt: genSalt,
        products: [],
        displayName: req.body.username,
        bio: "",
        token: ""
    });

    console.log(process.env);
    // Generate token for user
    user.token = jwt.sign( {id: user._id, username: user.username}, "secret", {expiresIn: "7d"})

    // Save User in the database
    user
        .save(user)
        .then(data => {
            res.status(200).send(data);
            return;
        })
        .catch(err => {
            res.status(500).send({
                message: "Some error occurred while creating the Users."
            });
            return
        });
});

// Retrieve all Users from the database.
exports.findAllUsers = (req, res) => {
    const email = req.query.email;
    var condition = email ? { email: { $regex: new RegExp(email), $options: "i" } } : {};

    User.find(condition)
        .then(data => {
            res.status(200).send(data);
            return;
        })
        .catch(err => {
            res.status(500).send({
                message: "Some error occurred while retrieving Users."
            });
            return;
        });
};


// Find a single User by their username
exports.findUser = (req, res, done) => {
    const username = req.params.username;
    User.findOne({username: username})
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: "No found Users with Username: " + username });
                done;
            }
            else res.status(200).send(data);;
            done;
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Users with username=" + username });
            done;
        });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    User.findByIdAndRemove(id, { useFindAndModify: false })
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

// Update a User
exports.updateUser = (req, res) => {
    const username = req.params.username;
    const authToken = req.headers['authorization'];
    console.log("UpdateUser - username: " + req.params.username);

    // new model to update the existing
    let updateFields = {};
    if (req.body.email !== "") updateFields.email = req.body.email;
    if (req.body.username !== "") updateFields.username = req.body.username;
    if (req.body.displayName !== "") updateFields.displayName = req.body.displayName;
    if (req.body.profilePicture !== "") updateFields.profilePicture = req.body.profilePicture;
    if (req.body.bio !== "") updateFields.bio = req.body.bio;
    if (req.body.password !== "") {
        const saltHash = genPassword(String(req.body.password));
        updateFields.salt = saltHash.salt;
        updateFields.hash = saltHash.hash;

    }

    // Add the last modified timestamp
    updateFields.lastModified = new Date();

    // Perform the update operation
    User.updateOne(
        { username: username },
        { $set: updateFields }
    ).catch (err => {
        res.status(304).send({ message: err.message || "Error occurred while editing User." });

    });
};

exports.addProduct = asyncHandler(async(req, res) => {
    const user = await User.findOne({username: req.params.username});
    if(!user) {
        res.status(404).send({
            message: "Not found Users with id " + username });
        return;
    }

    user.products.push(req.params.productId);
    user
        .save(user)
        .then(data => {
            res.status(200).send(data);
            return;
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while adding the product to user."
            });
            return
        });


});


// Middleware to add token to the blacklist
const blacklistToken = async (token) => {
    const blacklistEntry = new Blacklist({ token });
    await blacklistEntry.save();
};

// Logout a User
exports.logoutUser = asyncHandler(async (req, res) => {
    const token = req.headers["authorization"];

    if (!token) {
      return res.status(400).send({ message: "No token provided" });
    }

      if (!req.params.tokenInBlacklist) {

        // Add the token to the blacklist
        await blacklistToken(token);
        res.status(200).send({ message: "User logged out successfully" });

    }
});


// Verify user entered password and JWT token
exports.loginUser = asyncHandler(async (req, res) => {

    // Find user data by username in request
    let userToVerify = await User.findOne({username: req.body.username})

    // Check if No user was returned that is registered with inputed username.
    if (!userToVerify) {
        res.status(403).send( {message: "Invalid username, could not authorize user. Please log in and try again."} );
    }
    // Username matches a valid user
    else {

        // Check if the password is valid
        let isValid = validPassword(req.body.password, userToVerify.hash, userToVerify.salt);

        // If the password is not valid, return a 403 forbidden error
        if (!isValid) {
            res.status(403).send( {message: "Invalid password, could not authorize user. Please log in and try again."} );
        }

        // If the password is valid, save the user and generate a token
        // Verify the JWT before logging in the user
        try {
            await userToVerify.save();


            // Sign and send the JWT back to the client
            jwt.sign({ id:  mongoose.Types.ObjectId(userToVerify._id) , username: req.body.username }, "secret", { expiresIn: "14d" }, (err, token) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ message: "Failed to generate token" });
                }

                // Set the Authorization header to the JWT token
                // Allows postman to use the token in future requests
                // Client should store this then send back on each request
                res.set("Authorization", token);
                res.status(200).send({ message: "User authorized", token });
            });
        } catch (saveError) {
            console.log(saveError);
            res.status(500).send({ message: "Failed to save user" });
        }
    }
});

exports.searchUsersDB = asyncHandler(async(req, res) => {
    const queryString = req.query.search_query;
    await User.find({username: {$regex: queryString, $options: 'i'}})
    .then(data => {
        if (!data) {
            res.status(404).send({
                message: "No Users found matching: " + queryString });
            return;
        }
        extractedData = User.find({
            '_id': {
                $in : data
            },
            },
            { _id: 1, username: 1, displayName: 1, profilePicture: 1, bio: 1 }
        ).sort({ username : 1 })
        .then(data => {
            res.status(200).send(data);
            return;
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving User " + username });
            return;
        });
    });
})
