const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const asyncHandler = require('express-async-handler');
const validPassword = require('./password').validPassword;
const User = require("../models/users.model");

const customFields = {
    usernameField: 'username',
    passwordField: 'password'
};

const verifyCallback = asyncHandler(async(username, password, done) => {
    const user = await User.findOne({username: username})
    // No user registered with inputted email.
    if (!user) { 
        return done(null, false);
    }
    const isValid = validPassword(password, user.hash, user.salt);
    // Successful login.
    if (isValid) {
        user.save();
        return done(null, user);
    // Failed login.
    } else { 
        user.save();
        return done(null, false);
    }
})

const local_strategy  = new LocalStrategy(customFields, verifyCallback);

passport.use(local_strategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))
});

