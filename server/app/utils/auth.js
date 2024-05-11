const passport = require('passport');
const express = require("express");
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy;
const asyncHandler = require('express-async-handler');
const validPassword = require('./password').validPassword;
const User = require("../models/users.model");

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
        return done(null, false);
    }
})

const customFields = {
    usernameField: 'username',
    passwordField: 'password'
};

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

const checkLoggedInUser = asyncHandler(async(req, res, done) => {
    if (req.isAuthenticated()) {
        //res.status(200).json({ message: 'Welcome ' +  req.session.username });
        done();
    } else {
        return res.status(401).json({ message: 'Not authorized.' });
    }
})

const isUserPermitted = asyncHandler(async(req, res, done) => {
    if (req.isAuthenticated()) {
        if (req.user.username === req.params.username) {
            return res.status(200).json({ message: '(TESTING) Authorized ' + req.user.username });
        } else {
            return res.status(401).json({ message: '(TESTING) Not authorized - Editing an account that is not ' + req.user.username });
        }
    
    } else {
        return res.status(401).json({ message: '(TESTING) Not authorized.'});
    }
})

const isUserLoggedIn = asyncHandler(async(req, res, done) => {
    if (req.isAuthenticated()) {
        return res.status(400).json({message:'(TESTING) Already signed in.'});
    } else {
        done()
    }
})

module.exports = {checkLoggedInUser, isUserLoggedIn, isUserPermitted}

