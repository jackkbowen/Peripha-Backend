module.exports = app => {
    const user = require("../controllers/users.controller.js");
    const passport = require("passport")
    const {checkLoggedInUser, isUserLoggedIn} = require('../utils/auth');
    const passport_local = require('passport-local');
    const router = require("express").Router();

    // Returns login page (idk if we need this, just a placeholder. react router handles serving pages)
    router.get('/', (req, res) => {
        res.json({ message: "Welcome to Peripha Login Page." });
    });

    // Take login information and autenticate user
    router.post("/", isUserLoggedIn, passport.authenticate('local', {
        failureRedirect: '/login',
        failureMessage: true,
        session: true
        }), function(req, res) {
            res.redirect('/user/' + req.body.username);
        });

    app.use("/login", router);
};
  