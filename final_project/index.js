const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;
const config = require("./config");

const app = express();

app.use(express.json());

// Middleware to create a session for the customer
// The session is created with a secret key and is saved in the session object
// The session is used to store the user's access token
app.use(
  "/customer",
  session({
    secret: config.secretKey,
    resave: true,
    saveUninitialized: true,
  })
);

// Middleware to check if the user is authenticated
// If the user is not authenticated, return a 403 status code
// Otherwise, call the next middleware function in the stack
app.use("/customer/auth/*", function auth(req, res, next) {
  const accessToken = req.session?.authorization?.["accessToken"];
  if (!accessToken) {
    return res.status(403).json({ message: "Authorization failed." });
  }

  jwt.verify(accessToken, config.secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Authorization failed." });
    }
    req.user = user;
    next();
  });
});

app.use("/", genl_routes);
app.use("/customer", customer_routes);

app.listen(config.port, () =>
  console.log(`Server is running on :${config.port}`)
);
