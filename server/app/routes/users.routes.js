module.exports = app => {
    const user = require("../controllers/users.controller.js");
    const router = require("express").Router();
    const { verifyUserAccessAnyUser, verifyUserAccess } = require('../utils/password');

    // Returns user page (idk if we need this, just a placeholder. react router handles serving pages)
    router.get('/', (req, res) => {
        res.json({ message: "Welcome to Peripha Profile Page." });
    });

    // Fetch user information by username
    router.get("/:username", user.findUser);

    // Logout specific user with username
    router.post("/:username/logout", verifyUserAccessAnyUser, user.logoutUser);

    // Edit user info (user needs to be logged in before they are able to edit)
    router.put("/:username/edit", verifyUserAccess, user.updateUser);

    // Add Product to User
    router.post("/:username/addProduct/:productId", user.addProduct);

    // Get the search results based on the user entered query string
    router.get("/search/query", user.searchUsersDB);

    app.use("/user", router);
};
