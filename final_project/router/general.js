const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


let user = {};

public_users.get("/register", (req, res) => {
  // Extract 'username' and 'password' from query parameters
  const { username, password } = req.query;

  // Validate if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  if (user[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // If no errors, store the user (for simplicity, storing plain text password)
  user[username] = { username, password };

  // Return success message
  return res.status(201).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Use JSON.stringify to format the books data
    const formattedBooks = JSON.stringify(books, null, 2);  // Indentation for better readability
  
    // Send the formatted books data as a JSON response
    return res.status(200).json({
      message: "Books data successfully retrieved",
      books: formattedBooks
    });
  });
  

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    // Extract the ISBN from the request parameters
    const isbn = req.params.isbn;
  
    // Check if the ISBN exists in the books data
    if (books[isbn]) {
      // If the book exists, return the book data
      return res.status(200).json({
        message: "Book details successfully retrieved",
        book: books[isbn]
      });
    } else {
      // If the book doesn't exist, return an error message
      return res.status(404).json({
        message: "Book not found"
      });
    }
  });
  
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    // Extract the author from the request parameters
    const author = req.params.author.toLowerCase();
  
    // Filter the books by the provided author
    const booksByAuthor = Object.values(books).filter(book =>
      book.author.toLowerCase().includes(author)
    );
  
    // Check if there are any books by the given author
    if (booksByAuthor.length > 0) {
      return res.status(200).json({
        message: "Books by the author successfully retrieved",
        books: booksByAuthor
      });
    } else {
      return res.status(404).json({
        message: "No books found by the given author"
      });
    }
  });
  

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    // Extract the title from the request parameters
    const title = req.params.title.toLowerCase();
  
    // Filter the books whose title contains the provided search string
    const booksByTitle = Object.values(books).filter(book =>
      book.title.toLowerCase().includes(title)
    );
  
    // Check if any books were found
    if (booksByTitle.length > 0) {
      return res.status(200).json({
        message: "Books with the given title successfully retrieved",
        books: booksByTitle
      });
    } else {
      return res.status(404).json({
        message: "No books found with the given title"
      });
    }
  });
  
  // Get book review by ISBN
  public_users.get('/review/:isbn', function (req, res) {
    // Extract the ISBN from the request parameters
    const isbn = req.params.isbn;
  
    // Check if the book exists in the books data
    if (books[isbn]) {
      const book = books[isbn];
      
      // Check if the book has reviews
      if (Object.keys(book.reviews).length > 0) {
        return res.status(200).json({
          message: "Book reviews successfully retrieved",
          reviews: book.reviews
        });
      } else {
        return res.status(404).json({
          message: "No reviews available for this book"
        });
      }
    } else {
      return res.status(404).json({
        message: "Book not found"
      });
    }
  });
  

module.exports.general = public_users;
