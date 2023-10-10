/** User related routes. */

const User = require('../models/user');
const express = require('express');
const router = new express.Router();
const ExpressError = require('../helpers/expressError');
const { authUser, requireLogin, requireAdmin } = require('../middleware/auth');

const ALLOWED_FIELDS = ["first_name", "last_name", "phone", "email"];

/** GET /
 *
 * Get list of users. Only logged-in users should be able to use this.
 *
 * It should return only *basic* info:
 *    {users: [{username, first_name, last_name}, ...]}
 *
 */
// FIXES BUG #2: Listing Route Should Not Return All Fields
router.get('/', authUser, requireLogin, async function(req, res, next) {
  try {
    let users = await User.getAll();
    return res.json({ users: users.map(u => ({ username: u.username, first_name: u.first_name, last_name: u.last_name })) });
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
router.get('/:username', authUser, requireLogin, async function(req, res, next) {
  try {
    let user = await User.get(req.params.username);
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
router.patch('/:username', authUser, requireLogin, async function(req, res, next) {
  try {
    // Check if the user exists first
    const userExists = await User.get(req.params.username);
    if (!userExists) {
      throw new ExpressError('No such user', 404);
    }

    // Logging to troubleshoot
    console.log('req.curr_admin:', req.curr_admin);
    console.log('req.curr_username:', req.curr_username);

    // FIXES BUG #3: Users Should Be Able to Patch Themselves
    if (!req.curr_admin && req.curr_username !== req.params.username) {
      throw new ExpressError('Only that user or admin can edit a user.', 401);
    }

    // FIXES BUG #4: Users Should Not Be Able to Patch Username/Admin/Other Fields
    for (let field in req.body) {
      if (!ALLOWED_FIELDS.includes(field)) {
        throw new ExpressError('Not allowed to update this field', 401);
      }
    }

    let fields = { ...req.body };
    delete fields._token;

    let user = await User.update(req.params.username, fields);
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
router.delete('/:username', authUser, requireAdmin, async function(req, res, next) {
  try {
    // FIXES BUG #5: Deletion Always Reports Success
    await User.delete(req.params.username);
    return res.json({ message: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
