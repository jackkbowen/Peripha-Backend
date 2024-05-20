module.exports = app => {
  const user = require("../controllers/users.controller.js");

  var router = require("express").Router();

  // Returns login page (idk if we need this, just a placeholder. react router handles serving pages)
  router.get('/', (req, res) => {
    res.json({ message: "Welcome to Peripha Login Page." });
  });

  // Create a new User
  router.post("/register", user.create);

  // Fetch user information by username
  router.get("/:username", user.findUser);

   // Add Product to User
   router.post("/:username/addProduct/:productId", user.addProduct);



  app.use("/user", router);
};
