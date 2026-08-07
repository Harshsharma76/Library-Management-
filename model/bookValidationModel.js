const db = require("../config/db");

module.exports.checkBookIdExists = async (book_id, Cost) => {
  try {
    const sql = "select * from books where book_id=?";
    const [values, feilds] = await db.query(sql, [book_id, Cost]);
    return values;
  } catch (error) {
    return null;
  }
};

module.exports.checkBookNameExists = async (book_name) => {
  try {
    const sql = "select * from books where book_name=?";
    const [values, feilds] = await db.query(sql, [book_name]);
    return values;
  } catch (error) {
    return null;
  }
};
module.exports.checkBookAvailability = async (book_id) => {
  try {
    const sql = "SELECT available FROM books WHERE book_id = ?";
    const [rows] = await db.query(sql, [book_id]);
    return rows;
  } catch (error) {
    return null;
  }
};
module.exports.CheckAdmin = async (userId) => {
  try {
    const sql = "SELECT Role FROM users WHERE userId = ?";
    const [rows] = await db.query(sql, [userId]);

    if (rows.length === 0) {
      return null;
    }

    return rows[0].Role;
  } catch (error) {
    return null;
  }
};
module.exports.getBooksInfo = async (book_id) => {
  try {
    const sql = " SELECT * FROM books where book_id=?";
    const [rows] = await db.execute(sql, [book_id]);
    return rows;
  } catch (error) {
    return null;
  }
};
