module.exports = app => {
    const user = require("../controllers/users.controller.js");
    const router = require("express").Router();
    const { getJWTUser} = require('../utils/password');
  
    // Get user from token
    router.get("/", getJWTUser);

  
    app.use("/self", router);
};
  