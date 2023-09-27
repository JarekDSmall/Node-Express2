const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const { createToken } = require("../helpers/createToken");

// Updated Login Route Handler in auth.js
router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user.username, user.is_admin);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

router.post("/register", async function (req, res, next) {
  try {
    // Add input validation and password hashing here
    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
