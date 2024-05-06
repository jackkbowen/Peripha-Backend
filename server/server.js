const express = require("express");
const session = require('express-session')
const passport = require("passport")
require('./app/utils/auth');
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Connect to the Database
const db = require("./app/models");
const dbConfig = require("./app/config/db.config");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });


app.use(
  // cookie basic settings
  session({
      secret: 'somevalue',
      name: 'session-id',
      cookie: {
          maxAge: 1000 * 60 * 60 * 24, // 24 hours (mili, sec, min, hour)
          sameSite: true,

          // to turn on just in production
          secure: false, 
          httpOnly: false 
      },
      resave: false,
      saveUninitialized: true,
  })
)

// Passport initizilaization for resource authorization.
app.use(passport.initialize());
app.use(passport.session());


// Landing page route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Peripha Landing Page."});
});

// Routes to other pages
require("./app/routes/login.routes")(app);
require("./app/routes/signup.routes")(app);
require("./app/routes/admin.routes")(app);
require("./app/routes/products.routes")(app);
require("./app/routes/users.routes")(app);

// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
