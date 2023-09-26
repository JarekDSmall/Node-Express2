const express = require("express");
const app = express();
const ExpressError = require("./helpers/expressError");
const { authUser } = require("./middleware/auth");

app.use(express.json());

// Apply authUser middleware globally before any route definitions
app.use(authUser);

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);
app.use('/auth', authRoutes);

// Add the new route handler for the root URL here
app.get('/', (req, res) => {
  res.send('Welcome to the Bankly App!');
});

/** 404 handler */
app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message;
  return res.status(status).json({
    error: { message, status }
  });
}

app.use(errorHandler);

module.exports = app;
