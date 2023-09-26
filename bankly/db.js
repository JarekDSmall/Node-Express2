const { Pool } = require("pg");
const { DB_URI } = require("./config");

// Use a connection pool instead of a single 
const pool = new Pool({
  connectionString: DB_URI
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
