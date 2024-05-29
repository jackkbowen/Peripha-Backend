const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require("../models/users.model");
const Reviews = require("../models/reviews.model");
const jwt = require("jsonwebtoken"); 
const userController = require("../controllers/users.controller.js");

function genPassword(password) {
    const salt = crypto.randomBytes(32).toString('hex');
    const genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
    return {
      salt: salt,
      hash: genHash
    };
}

function validPassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
    return hash === hashVerify;
}


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

function checkToken(req, res) {
    const tokenBody = req.headers['Authorization'];
    console.log("checkToken - tokenBody: " + tokenBody);

    if(typeof tokenBody !== 'undefined') {
        const bearer = tokenBody.split(' ');
        const token = bearer[1];

        req.token = token;
        
    } else {
        //If header is undefined return Forbidden (403)
        res.status(403).send( { message: 'Error authenticating token, please log in'} );
    }
}

async function verifyJWT(authToken, req, res) {
    console.log("verifyJWT - authToken: " + authToken);

    if (!authToken) {
        res.status(403).send({ message: 'No Auth Token - You are not authorized to access this page. Please log in.' });
        return;
    } else {
        try {
            const user = await new Promise((resolve, reject) => {
                jwt.verify(authToken, 'secret', (err, decoded) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(decoded);
                    }
                });
            });

            userData = await User.findById(user.id);
            if (!userData){
                res.status(403).send({ message: "No ID found for the JWT token. Please log in again." });
            }

            console.log("verifyJWT - userID: " + user.id);
            console.log("verifyJWT - username: " + userData.username);

            console.log("verifyJWT - userData: " + userData);
            return userData.username
        } catch (err) {
            console.log(err);
            res.status(403).send( { message: 'Verify JWT Failure', error: err } );
            return; 
        }
    }
}

function verifyUserAccessAnyUser(req, res, done) {
    // Extract the JWT token
    const authToken = req.headers["authorization"];
    const token = authToken.split(' ')[1];
    console.log("Token verifyUserAccess: " + token);

    verifyJWT(token, req, res).then(async(username) => {
        console.log("After verifyJWT request - username: " + username)
        console.log("After verifyJWT request - username: " + req.params.username)
        req.params.username = username

        if (username) {
            console.log("Usernames match in verifyUserAccessAnyUser, continue to next page")
            done ();
        }
        console.log("end of verifyUserAccessAnyUser")
    }).catch(err => {
            console.log(err);
            res.status(500).send( {message: "Some error occurered in verifyUserAccessAnyUser. Please try again."} );
        });
}

function verifyUserAccess(req, res, done) {
    const authToken = req.headers["authorization"];
    const token = authToken.split(' ')[1];
    console.log("Token verifyUserAccess: " + token);

    verifyJWT(token, req, res).then(async(username) => {
        console.log("After verifyJWT request - username: " + username)

        if ((!req.body.username) && (!req.params.username)) {
            const reviewId = mongoose.Types.ObjectId(req.params.reviewId);
            userData = await Reviews.findById(reviewId).select('username');
            if (userData) {
                req.params.username = userData.username;
                console.log("Changing params username: " + userData.username);
            }
        }
        

        console.log("After verifyJWT request - username: " + req.params.username)

        var comparisonUsername = req.params.username ?? req.body.username;

        if (username) {
            if (comparisonUsername == username) {
                console.log("Usernames match in verifyUserAccess, continue to next page")
                done();
            }
            else {
                return res.status(403).send( {message: "You cannot access accounts that are not yours. Please log in."} ) 
            }
        }
        console.log("end of verifyUserAccess")
        res.status(202).send( { message: "Backend call with JWT auth successful."} );
    })
}



module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.verifyUser = verifyUser;
module.exports.checkToken = checkToken;
module.exports.verifyUserAccess = verifyUserAccess;
module.exports.verifyUserAccessAnyUser = verifyUserAccessAnyUser;
module.exports.verifyJWT = verifyJWT;


