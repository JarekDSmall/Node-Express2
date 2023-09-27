
require('dotenv').config();

const app = require("./app");
const { PORT } = require("./config");

const server = app.listen(PORT, function () {
  console.log(`Server starting on port ${PORT}`);
});

module.exports = server; // Export the server for testing purposes
