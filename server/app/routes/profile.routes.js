module.exports = app => {
    const user = require("../controllers/users.controller.js");
    const router = require("express").Router();
    const { verifyUserAccessAnyUser, verifyUserAccess } = require('../utils/password');

    // Returns profile page (idk if we need this, just a placeholder. react router handles serving pages)
    router.get('/', (req, res) => {
        res.json({ message: "Welcome to Peripha Profile Page." });
    });

    // Access user's profile page
    router.get("/:email", user.checkInformation);

    app.use("/profile", router);
};
  