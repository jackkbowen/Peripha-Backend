const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
require('dotenv').config()
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.users = require("../models/users.model.js")(mongoose);
db.products = require("../models/products.model.js")(mongoose);

module.exports = db;
