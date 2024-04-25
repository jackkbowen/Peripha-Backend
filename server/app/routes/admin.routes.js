module.exports = app => {
  const user = require("../controllers/users.controller.js");

  var router = require("express").Router();

  // Retrieve all Users
  router.get("/", user.findAll);

  // Retrieve a single Tutorial with id
  router.get("/:id", user.findOne);

  // Delete a Tutorial with id
  router.delete("/:id", user.delete);

  app.use("/admin", router);
};