module.exports = app => {
    const user = require("../controllers/users.controller.js");
    const passport = require("passport")
    const {checkLoggedInUser, isUserLoggedIn, isUserPermitted} = require('../utils/auth');
    var router = require("express").Router();
  
    // Returns user page (idk if we need this, just a placeholder. react router handles serving pages)
    router.get('/', (req, res) => {
        res.json({ message: "Welcome to Peripha Profile Page." });
    });
  
    // Fetch user information by username
    router.get("/:username", user.findUser);
  
    // Logout specific user with username
    router.post("/:username/logout", checkLoggedInUser, user.logoutUser);
  
    // Edit user info (user needs to be logged in before they are able to edit)
    router.put("/:username/edit", isUserPermitted, user.updateUser);

    // Add Product to User
   router.post("/:username/addProduct/:productId", user.addProduct);
  
    app.use("/user", router);
};
  