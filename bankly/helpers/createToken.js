const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

function createToken(user) {
  if (!user) {
    throw new Error("Invalid user object: User object is undefined or null");
  }
  if (!user.username) {
    throw new Error("Invalid user object: Username is undefined");
  }
  if (typeof user.is_admin === 'undefined') {
    throw new Error("Invalid user object: is_admin property is undefined");
  }

  let payload = {
    username: user.username,
    is_admin: user.is_admin,
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
}

module.exports = createToken;
