const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** Middleware: Authenticate user. */
function authUser(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    req.user = payload; // create a current user
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware: Requires user is authenticated. */
function requireLogin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  } else {
    return next();
  }
}

/** Middleware: Requires correct username. */
function ensureCorrectUser(req, res, next) {
  try {
    if (req.user.username === req.params.username) {
      return next();
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return res.status(401).json({ message: "Unauthorized" });
  }
}

/** Middleware: Requires user is an admin. */
function requireAdmin(req, res, next) {
  try {
    if (req.user && req.user.is_admin) {
      return next();
    } else {
      return res.status(403).json({ message: "Forbidden: Admin privileges required" });
    }
  } catch (err) {
    return res.status(403).json({ message: "Forbidden: Admin privileges required" });
  }
}

module.exports = {
  authUser,
  requireLogin,
  ensureCorrectUser,
  requireAdmin
};
