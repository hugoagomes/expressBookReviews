const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Finds a user by username in the users array
// Returns the user if found, otherwise returns null
const findByUsername = (username) => {
  const filtered = users.filter((user) => user.username == username);
  return filtered.length > 0 ? filtered[0] : null;
};

// Checks if the user is registered
const isValid = (username) => {
  return findByUsername(username) !== null;
};

// Checks if the user is authenticated using the username and password
// Returns true if the user is authenticated, otherwise returns false
const authenticatedUser = (username, password) => {
  const user = findByUsername(username);
  return user !== null && user.password === password;
};

// Login endpoint to authenticate the user
// If the user is authenticated, return a 200 status code
// Otherwise, return a 401 status code with an error message
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const accessToken = jwt.sign(
    {
      data: password,
    },
    config.secretKey,
    { expiresIn: "1h" }
  );

  req.session.authorization = { accessToken: accessToken };
  return res.status(200).json({ message: "Login successful" });
});

// Adds a book review for the authenticated user
// If the book is not found, return a 404 status code
// Otherwise, add the review to the book and return a 200 status code
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  book.reviews[username] = review;
  return res.status(200).json({ messsage: "Review added successfully" });
});

// Deletes a book review for the authenticated user
// If the book is not found, return a 404 status code
// If the review is not found, return a 404 status code
// Otherwise, delete the review and return a 200 status code
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  console.log(book);
  if (!book.reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  delete book.reviews[username];
  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
