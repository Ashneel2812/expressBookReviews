const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if the session already contains a user object
  if (req.session.user) {
    return next();  // If the user is authenticated in the session, move to the next middleware/route handler
  }

  // Get the access token from the request header (or cookies, depending on how the token is sent)
  const token = req.headers['authorization']?.split(' ')[1] || req.cookies['access_token'];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // Verify the token using the secret (this can vary based on how your tokens are signed)
  jwt.verify(token, 'your_jwt_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }

    // If token is valid, save the user information in the session
    req.session.user = decoded.user;  // Assuming the token contains the user data in the payload
    next();  // Proceed to the next middleware or route handler
  });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
