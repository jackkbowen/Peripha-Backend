module.exports = app => {
    const user = require("../controllers/users.controller.js");
    const router = require("express").Router();
    const passport = require("passport");

    // Returns login page (idk if we need this, just a placeholder. react router handles serving pages)
    router.get('/', (req, res) => {
        res.json({ message: "Welcome to Peripha Login Page." });
    });

    // Take login information and autenticate user
    router.post("/", passport.authenticate('local', {
        successReturnToOrRedirect: '/',
        failureRedirect: '/login',
        failureMessage: true
    }));


    app.use("/login", router);
};
  