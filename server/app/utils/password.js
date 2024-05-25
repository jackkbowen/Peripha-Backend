const crypto = require('crypto');
const User = require("../models/users.model");
const jwt = require("jsonwebtoken"); 

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

async function verifyUserAccess(authToken, res) {
    console.log("verifyUserAccess - authToken: " + authToken);

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

            console.log("verifyUserAccess - user: " + user.id);
            return user.id; // Return the user ID if needed
        } catch (err) {
            console.log(err);
            res.status(403).send({ message: 'Verify Failure', error: err });
            return; 
        }
    }
}


module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.verifyUser = verifyUser;
module.exports.checkToken = checkToken;
module.exports.verifyUserAccess = verifyUserAccess;


