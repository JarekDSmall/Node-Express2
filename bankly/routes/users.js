/** User related routes. */

const User = require('../models/user');
const express = require('express');
const router = new express.Router();
const ExpressError = require('../helpers/expressError');
const { authUser, ensureCorrectUser, requireAdmin } = require('../middleware/auth');
const db = require('../db');


/** GET /
 *
 * Get list of users. Only logged-in users should be able to use this.
 *
 * It should return only *basic* info:
 *    {users: [{username, first_name, last_name}, ...]}
 *
 */

// Updated Listing Route Handler in users.js
router.get("/", authUser, async function (req, res, next) {
  try {
    let users = await User.findAll();
    users = users.map(u => ({
      username: u.username,
      first_name: u.first_name,
      last_name: u.last_name,
    }));
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});



/** GET /[username]
 *
 * Get details on a user. Only logged-in users should be able to use this.
 *
 * It should return:
 *     {user: {username, first_name, last_name, phone, email}}
 *
 * If user cannot be found, return a 404 err.
 *
 */

router.get("/:username", authUser, async function (req, res, next) {
  try {
    const user = await User.findOne(req.params.username);
    if (!user) {
      throw new ExpressError("User not found", 404);
    }

    // Check if the requester is either the user themselves or an admin
    if (req.user.username !== req.params.username && !req.user.is_admin) {
      throw new ExpressError("Unauthorized", 401);
    }

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[username]
 *
 * Update user. Only the user themselves or any admin user can use this.
 *
 * It should accept:
 *  {first_name, last_name, phone, email}
 *
 * It should return:
 *  {user: all-data-about-user}
 *
 * It user cannot be found, return a 404 err. If they try to change
 * other fields (including non-existent ones), an error should be raised.
 *
 */

router.patch("/:username", authUser, ensureCorrectUser, async function (req, res, next) {
  try {
    // Check if the user is allowed to patch themselves
    if (req.user.username !== req.params.username && !req.user.is_admin) {
      throw new ExpressError("Unauthorized", 401);
    }

    // Check for fields that should not be allowed
    const disallowedFields = ["username", "admin"];
    for (const field of disallowedFields) {
      if (field in req.body) {
        throw new ExpressError(`Cannot update '${field}' field`, 401);
      }
    }

    let fields = { ...req.body };
    delete fields._token;

    let user = await User.update(req.params.username, fields);
    if (!user) {
      throw new ExpressError("User not found", 404);
    }

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[username]
 *
 * Delete a user. Only an admin user should be able to use this.
 *
 * It should return:
 *   {message: "deleted"}
 *
 * If user cannot be found, return a 404 err.
 */

router.delete('/:username', authUser, requireAdmin, async function (req, res, next) {
  try {
    const user = await User.findOne(req.params.username);
    if (!user) {
      throw new ExpressError("User not found", 404);
    }

    await User.delete(req.params.username); // Added await to ensure the user is deleted before sending a response
    return res.json({ message: 'deleted' });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
