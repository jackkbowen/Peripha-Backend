const User = require('../models/users.model');
const Blacklist = require('../models/blacklist.model');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { validPassword, genPassword } = require('../utils/password');

// Create and Save a new User
exports.create = asyncHandler(async (req, res) => {
  if (!req.body.email) {
    res.status(400).send({ message: 'Email field cannot be empty' });
    return;
  }
  if (!req.body.username) {
    res.status(400).send({ message: 'Username field cannot be empty' });
    return;
  }
  if (!req.body.password) {
    res.status(400).send({ message: 'Password field cannot be empty' });
    return;
  }

  const userExists = await User.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username }]
  });

  if (userExists) {
    res.status(409).send({
      message: 'ERROR: User already exists. Please use a different email or username.',
      email: req.body.email
    });
    return;
  }

  const saltHash = genPassword(String(req.body.password));
  const genSalt = saltHash.salt;
  const genHash = saltHash.hash;

  const user = new User({
    email: req.body.email,
    username: req.body.username,
    hash: genHash,
    profilePicture: 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg',
    salt: genSalt,
    products: [],
    displayName: req.body.username,
    bio: '',
    token: ''
  });

  user.token = jwt.sign(
    { id: user._id, username: user.username },
    'secret',
    { expiresIn: '7d' }
  );

  user.save()
    .then(data => {
      res.status(200).send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: 'Some error occurred while creating the User.'
      });
    });
});

// Retrieve all Users from the database
exports.findAllUsers = (req, res) => {
  const email = req.query.email;
  const condition = email ? { email: { $regex: new RegExp(email), $options: 'i' } } : {};

  User.find(condition)
    .then(data => {
      res.status(200).send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: 'Some error occurred while retrieving Users.'
      });
    });
};

// Find a single User by their username
exports.findUser = (req, res, done) => {
  const username = req.params.username;

  User.findOne({ username: username })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: 'Not found User with username ' + username
        });
        done();
      } else {
        res.status(200).send(data);
        done();
      }
    })
    .catch(err => {
      res.status(500).send({
        message: 'Error retrieving User with username=' + username
      });
      done();
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      } else {
        res.status(200).send({
          message: 'User was deleted successfully!'
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: 'Could not delete User with id=' + id
      });
    });
};

// Update a User
exports.updateUser = (req, res) => {
  const username = req.params.username;

  const updateFields = {};
  if (req.body.email !== '') updateFields.email = req.body.email;
  if (req.body.username !== '') updateFields.username = req.body.username;
  if (req.body.displayName !== '') updateFields.displayName = req.body.displayName;
  if (req.body.profilePicture !== '') updateFields.profilePicture = req.body.profilePicture;
  if (req.body.bio !== '') updateFields.bio = req.body.bio;
  if (req.body.password !== '') {
    const saltHash = genPassword(String(req.body.password));
    updateFields.salt = saltHash.salt;
    updateFields.hash = saltHash.hash;
  }

  updateFields.lastModified = new Date();

  User.updateOne(
    { username: username },
    { $set: updateFields }
  ).catch(err => {
    res.status(304).send({ message: err.message || 'Error occurred while editing User.' });
  });
};

// Add a product to a user
exports.addProduct = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });

  if (!user) {
    res.status(404).send({
      message: 'Not found User with username ' + req.params.username
    });
    return;
  }

  user.products.push(req.params.productId);

  user.save()
    .then(data => {
      res.status(200).send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || 'Some error occurred while adding the product to the user.'
      });
    });
});

// Middleware to add token to the blacklist
const blacklistToken = async token => {
  const blacklistEntry = new Blacklist({ token });
  await blacklistEntry.save();
};

// Logout a User
exports.logoutUser = asyncHandler(async (req, res) => {
  const token = req.headers.authorization;

  if (!req.params.tokenInBlacklist) {
    if (!token) {
      return res.status(400).send({ message: 'No token provided' });
    }

    await blacklistToken(token);
    res.status(200).send({ message: 'User logged out successfully' });
  }
});

// Verify user entered password and JWT token
exports.loginUser = asyncHandler(async (req, res) => {
  const userToVerify = await User.findOne({ username: req.body.username });

  if (!userToVerify) {
    res.status(403).send({ message: 'Invalid username, could not authorize user. Please log in and try again.' });
  } else {
    const isValid = validPassword(req.body.password, userToVerify.hash, userToVerify.salt);

    if (!isValid) {
      res.status(403).send({ message: 'Invalid password, could not authorize user. Please log in and try again.' });
    } else {
      try {
        await userToVerify.save();

        jwt.sign(
          { id: mongoose.Types.ObjectId(userToVerify._id), username: req.body.username },
          'secret',
          { expiresIn: '14d' },
          (err, token) => {
            if (err) {
              return res.status(500).send({ message: 'Failed to generate token' });
            }

            res.set('Authorization', token);
            res.status(200).send({ message: 'User authorized', token });
          }
        );
      } catch (saveError) {
        res.status(500).send({ message: 'Failed to save user' });
      }
    }
  }
});
