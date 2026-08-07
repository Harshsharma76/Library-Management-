const db = require("../config/db");

module.exports.generateRecordId = async () => {
  const sql = `
    SELECT records_id
    FROM records
    ORDER BY records_id DESC
    LIMIT 1
  `;

  const [rows] = await db.query(sql);

  if (rows.length === 0) {
    return "R001";
  }

  const lastId = rows[0].records_id;
  const num = parseInt(lastId.substring(1)) + 1;

  return `R${num.toString().padStart(3, "0")}`;
};

module.exports.generateUserId = async () => {
  const sql = `
    SELECT userId
    FROM users
    ORDER BY userId DESC
    LIMIT 1
  `;

  const [rows] = await db.query(sql);

  if (rows.length === 0) {
    return "EZ0001";
  }

  const lastId = rows[0].userId;
  const num = parseInt(lastId.substring(2), 10) + 1;

  return `EZ${num.toString().padStart(4, "0")}`;
};

module.exports.generateBookId = async () => {
  const sql = `
    SELECT book_id
    FROM books
    ORDER BY book_id DESC
    LIMIT 1
  `;

  const [rows] = await db.query(sql);

  if (rows.length === 0) {
    return "B001";
  }

  const lastId = rows[0].book_id;
  const num = parseInt(lastId.substring(1), 10) + 1;

  return `B${num.toString().padStart(3, "0")}`;
};
