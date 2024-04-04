const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Registers a user with a username and password
// If the user is already registered, return a 409 status code
// If the input is invalid, return a 400 status code
// Otherwise, return a 201 status code
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Invalid input" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username: username, password: password });
  return res.status(201).json({ message: "User created" });
});

const getBooks = async () => {
  return books;
};

// Gets the book list available in the shop
// Returns the list of books in JSON format
public_users.get("/", async function (req, res) {
  const books = await getBooks();
  return res.json(books);
});

// Gets book details based on ISBN
// If the book is not found, return a 404 status code
// Otherwise, return the book details
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = parseInt(req.params.isbn || -1);

  const findBook = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (!book) {
      reject({ message: "Book not found" });
    }
    resolve(books[isbn]);
  });

  findBook
    .then((book) => {
      return res.json(book);
    })
    .catch((error) => {
      return res.status(404).json(error);
    });
});

// Gets book details based on author
// If the book is not found, return a 404 status code
// Otherwise, return the book details
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;

  const book = Object.values(books).find((book) => book.author === author);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.json(book);
});

// Gets all books based on title
// If the book is not found, return a 404 status code
// Otherwise, return the book details
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;

  const book = Object.values(books).find((book) => book.title === title);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.json(book);
});

// Gets book reviews based on ISBN
// If the book is not found, return a 404 status code
// Otherwise, return the reviews for the book
public_users.get("/review/:isbn", function (req, res) {
  const isbn = parseInt(req.params.isbn || -1);

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.json(book.reviews);
});

module.exports.general = public_users;
