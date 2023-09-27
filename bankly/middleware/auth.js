const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

/** Middleware: Authenticate user. */
function authUser(req, res, next) {
  try {

    console.log('Authorization Header:', req.headers.authorization);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ExpressError("Unauthorized: Token missing", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new ExpressError("Unauthorized: Token malformed", 401);
    }

// Check if the token has three parts separated by dots
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      throw new ExpressError("Unauthorized: Token malformed", 401);
    }

    // Log the received token
    console.log('Received Token:', token);

    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;

    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware: Requires correct username. */
function ensureCorrectUser(req, res, next) {
  try {
    if (!req.user || req.user.username !== req.params.username) {
      throw new ExpressError("Unauthorized: Incorrect username", 401);
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware: Requires user to be an admin. */
function requireAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.is_admin) {
      throw new ExpressError("Forbidden: Admin privileges required", 403);
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authUser,
  ensureCorrectUser,
  requireAdmin,
};
