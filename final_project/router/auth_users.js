const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  // Example users
  {
    username: "john_doe",
    password: "password123"
  },
  {
    username: "jane_smith",
    password: "mypassword"
  }
];

const SECRET_KEY = "your_secret_key"; // Secret key for JWT

// Function to check if username is valid
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Function to authenticate the username and password
const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username);
  return user && user.password === password;
};

// Login route for user authentication
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the user exists and the password matches
  if (authenticatedUser(username, password)) {
    // Generate a JWT token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    return res.status(200).json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Middleware to authenticate the user via JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Add a book review - Only authenticated users can add a review
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  
  // Ensure the review is provided
  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  // Check if the book exists in the database
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add the review to the book's reviews object
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add review from the authenticated user
  books[isbn].reviews[req.user.username] = review;

  return res.status(200).json({
    message: "Review added successfully",
    book: books[isbn]
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;