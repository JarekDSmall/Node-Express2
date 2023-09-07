/** Application for bank.ly */

const express = require("express");
const app = express();
const ExpressError = require("./helpers/expressError");
const { authenticateJWT } = require("./middleware/auth");


app.use(express.json());

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

app.use(authenticateJWT);
app.use('/auth', authRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
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

module.exports = {
  app,
  errorHandler
};

