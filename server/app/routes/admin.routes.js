module.exports = app => {
    const user = require("../controllers/users.controller.js");
    var router = require("express").Router();
    const { verifyUserAccessAnyUser, verifyUserAccess } = require('../utils/password');
  
    // Retrieve all Users
    router.get("/", user.findAllUsers);
  
    // Retrieve a single User with email
    router.get("/:username", user.findUser);
  
    // Delete a Tutorial with id
    router.delete("/:id", user.delete);
    
    app.use("/admin", router);
};