module.exports = app => {
    const user = require("../controllers/users.controller.js");
    const router = require("express").Router();
    const { verifyUserAccessAnyUser, verifyUserAccess } = require('../utils/password');

    // Returns signup page (idk if we need this, just a placeholder. react router handles serving pages)
    router.get('/', (req, res) => {
        res.json({ message: "Welcome to Peripha Signup Page." });
    });

    // Create a new User
    router.post("/", user.create);

    app.use("/signup", router);
};
  