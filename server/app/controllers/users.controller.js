const db = require("../models");
const Users = db.users;

// Create and Save a new Users
exports.create = (req, res) => {
  // Validate request
  if (!req.body.email) {
      res.status(400).send({message: "Email field cannot be empty"})
      return;
  } else if (!req.body.username) {
      res.status(400).send({message: "Username field cannot be empty"})
      return;
  } else if (!req.body.password) {
      res.status(400).send({message: "Password field cannot be empty"})
      return;
  } 

  // Create a new User
  const user = new Users({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  });

  // Save User in the database
  user
    .save(user)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Users."
      });
    });
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  const email = req.query.email;
  var condition = email ? { email: { $regex: new RegExp(email), $options: "i" } } : {};

  Users.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Users."
      });
    });
};

// Check if email and password exists in the database
exports.checkInformation = (req, res) => {

  const query = Users.find({email: req.params['email']});
  query.getFilter();

  const results = query.exec();

  res.send(req.params['email']);
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Users.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Users with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Users with id=" + id });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Users.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Users with id=${id}. Maybe Users was not found!`
        });
      } else {
        res.send({
          message: "Users was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Users with id=" + id
      });
    });
};


