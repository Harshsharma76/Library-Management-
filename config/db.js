const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Harsh@123",
  database: "library",
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log("Connected to MySQL database");
    connection.release();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();

module.exports = db;