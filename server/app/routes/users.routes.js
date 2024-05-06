module.exports = app => {
  const user = require("../controllers/users.controller.js");

  var router = require("express").Router();

  // Returns user page (idk if we need this, just a placeholder. react router handles serving pages)
  router.get('/', (req, res) => {
    res.json({ message: "Welcome to Peripha Profile Page." });
  });

 
  // Fetch user information by username
  router.get("/:username", user.findUser);

  // Logout specific user with username
  router.post("/:username/logout", function (req, res, done) {
    req.logout(function(error) {
      if (error) {
        return done(error);
      }
      res.redirect("/login");
    })
  })



  app.use("/user", router);
};
