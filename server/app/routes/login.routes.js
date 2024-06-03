module.exports = app => {
    const user = require("../controllers/users.controller.js");
    const router = require("express").Router();
    const { verifyUserAccessAnyUser, verifyUserAccess } = require('../utils/password');

    // Returns login page (idk if we need this, just a placeholder. react router handles serving pages)
    router.get('/', (req, res) => {
        res.json({ message: "Welcome to Peripha Login Page." });
    });

    // Take login information and autenticate user
    router.post("/", user.loginUser);
       
    app.use("/login", router);
};
  