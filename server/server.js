const express = require("express");
const session = require('express-session')
const passport = require("passport");
const cors = require("cors");
const MongoDBStore = require('connect-mongodb-session')(session)

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Connect to the Database
const db = require("./app/models");
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

// Initialize Session token
const sessionStore = new MongoDBStore({
  uri: db.url,
  collection: 'sessions',
})


app.use(
    // cookie basic settings
    session({
        secret: 'somevalue',
        name: 'session-id',
        store: sessionStore,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // How long it takes for cookies to expire. 24 hours (mili, seconds, minutes, hours)
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
require("./app/routes/profile.routes")(app);
require("./app/routes/signup.routes")(app);
require("./app/routes/admin.routes")(app);

// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
