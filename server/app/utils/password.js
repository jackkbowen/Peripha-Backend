const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require("../models/users.model");
const Blacklist = require("../models/blacklist.model");
const Reviews = require("../models/reviews.model");
const jwt = require("jsonwebtoken");
const userController = require("../controllers/users.controller.js");

// Function to generate a hashed password and salt
// Used in account creation to encode password
function genPassword(password) {
    const salt = crypto.randomBytes(32).toString('hex');
    const genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
    return {
      salt: salt,
      hash: genHash
    };
}

// Function to validate if the provided password matches the stored hash and salt
function validPassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
    return hash === hashVerify;
}

// Verify a username is valid and check if the password matches the encrypted salt/hash
function verifyUser (username, password) {
    const user = User.findOne({username: username})

    // No user registered with inputted email.
    if (!user) {
        return false
    }

    const isValid = validPassword(password, user.hash, user.salt);
    // Successful login.
    if (isValid) {
        user.save();
        return true;

    // Failed login.
    } else {
        console.log('Invalid username or password');
        return false;
    }

};

// Verifies JWT of the token passed in authToken
// Returns the username of the user with the corresponding token
async function verifyJWT(authToken, req, res, done) {

    // Verifies an authToken exists
    // authToken is extracted token from header
    try {
        // Check if the token is in the blacklist
        req.params.tokenInBlacklist = await Blacklist.findOne({ token: authToken });
        if (req.params.tokenInBlacklist) {
            res.status(403).send({ message: 'Token is blacklisted. Please log in again.' });
            return done();
        }

        // Decode a user from the JWT using the authToken
        const user = await new Promise((resolve, reject) => {
            jwt.verify(authToken, 'secret', (err, decoded) => {
                if (err) {
                    reject(err);
                    done();
                } else {
                    resolve(decoded);
                }
            });
        });

        // Get user info from ID returned by decoding JWT
        userData = await User.findById(user.id);
        if (!userData){
            res.status(403).send({ message: "No ID found for the JWT token. Please log in again." });
            done();
        }
        return userData.username;
    } catch (err) {
        console.log(err);
        done();
    }

}

// Verifies JWT of the token passed in authToken
// Sends back the user data associated with the JWT Token
async function getJWTUser(req, res, done) {
    // Verifies an authToken exists
    // authToken is extracted token from header
    if (!req.headers.authorization) {
        res.status(403).send({ message: 'No Auth Token - You are not authorized to access this page. Please log in.' });
        done();
    } else {
        try {

            // Decode a user from the JWT using the authToken
            const user = await new Promise((resolve, reject) => {
                jwt.verify(req.headers.authorization, 'secret', (err, decoded) => {
                    if (err) {
                        reject(err);
                        done();
                    } else {
                        resolve(decoded);
                    }
                });
            });

            // Get user info from ID returned by decoding JWT
            userData = await User.findById(user.id);
            if (!userData){
                res.status(403).send({ message: "No ID found for the JWT token. Please log in again." });
                done();
            }
            res.status(200).send(userData)
            done()
        } catch (err) {
            console.log(err);
            res.status(403).send( { message: 'Verify JWT Failure', error: err } );
            done();
        }
    }
}

// General Auth function to check if there is ANY user signed in
// Used for logout and other functions that dont require a protected route for a specific user
function verifyUserAccessAnyUser(req, res, done) {
    // Extract the JWT token
    // May have "Bearer" in front of token based on how req is sent, need to split
    const token = req.headers["authorization"];
    if (!token) {
      res.status(403).send({ message: 'No Auth Token - You are not authorized to access this page. Please log in.' });
      return;
    }

    // Decode the JWT token passed in the req.headers["authorization"]
    verifyJWT(token, req, res, done).then(async(username) => {

        // Set the username parameter as the username decoded from verify
        // Makes easy use of the decoded username in subsequent requests
        req.params.username = username

        if (username) {
            // If a username exists, continue
            done ();
        }
        // Error occurs if there is no username associated with the JWT
    })
}

// More specific auth function to verify the user is making a request to a page they own
// Checks for the lack of username in param and body, this is the case for review/product requests
// Fills the decoded username in the params in this case
// Returns the user info that was decoded
function verifyUserAccess(req, res, done) {
    const authToken = req.headers["authorization"];

    verifyJWT(token, req, res, done).then(async(username) => {

        // Query to get the username from review (if applicable)
        // Maybe should move to reviews function
        if ((!req.body.username) && (!req.params.username)) {
            const reviewId = mongoose.Types.ObjectId(req.params.reviewId);
            userData = await Reviews.findById(reviewId).select('username');

            // Store username in params if userData found
            if (userData) {
                req.params.username = userData.username;
            }
        }

        // Set comparisonUsername to whichever is not unidentified
        var comparisonUsername = req.params.username ?? req.body.username;

        // If a username exists, continue if it matches comparisonUsername
        // Matching JWT to request user
        if (username) {
            if (comparisonUsername == username) {
                done();
            }
            else {
                res.status(403).send( {message: "You cannot access accounts that are not yours. Please log in."} )
            }
        }
    })
}



module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.verifyUser = verifyUser;
module.exports.verifyUserAccess = verifyUserAccess;
module.exports.verifyUserAccessAnyUser = verifyUserAccessAnyUser;
module.exports.verifyJWT = verifyJWT;
module.exports.getJWTUser = getJWTUser


