const db = require("../config/db");

module.exports.insertUser = async (userData) => {
  const {
    userId,
    userName,
    phoneNo,
    EmailID,
    password,
    role,
    Balance,
    Status,
  } = userData;

  const sql = `
  INSERT INTO users (userId, userName, phoneNo, EmailID , password, role, Balance, Status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  const [result] = await db.execute(sql, [
    userId,
    userName,
    phoneNo,
    EmailID,
    password,
    role,
    Balance,
    Status,
  ]);

  return result;
};

module.exports.insertBook = async (bookData) => {
  const {
    book_id,
    book_name,
    book_theme,
    author,
    available,
    Cost,
    PerDayCharge,
  } = bookData;

  const sql = `
      INSERT INTO books (book_id, book_name, book_theme,author,available,Cost,PerDayCharge)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
  const [result] = await db.execute(sql, [
    book_id,
    book_name,
    book_theme,
    author,
    available,
    Cost,
    PerDayCharge,
  ]);

  return result;
};

module.exports.insertRecord = async (recordData) => {
  const {
    records_id,
    userId,
    book_id,
    IssueDate,
    ExpectedReturnDate,
    Charge,
    Status,
    RefundAmount,
  } = recordData;
  console.log(recordData);
  const sql = `
      INSERT INTO records (records_id,userId,book_id,IssueDate,ExpectedReturnDate,Charge,Status,RefundAmount)
      VALUES (?, ?, ?, ?, ?,?,?,?)
    `;
  const [result] = await db.execute(sql, [
    records_id,
    userId,
    book_id,
    IssueDate,
    ExpectedReturnDate,
    Charge,
    Status,
    RefundAmount,
  ]);
  return result;
};

module.exports.updateBookAvailability = async (book_id, status) => {
  const sql = "UPDATE books SET available=? WHERE book_id=?";
  const [result] = await db.execute(sql, [status, book_id]);
  return result;
};

module.exports.updateRecords = async (
  records_id,
  status,
  Charge,
  ReturnedOn,
  RefundAmount,
) => {
  const sql =
    "UPDATE records SET status=? ,Charge = ? , ReturnedOn=?,RefundAmount=? WHERE records_id=?";
  const [result] = await db.execute(sql, [
    status,
    Charge,
    ReturnedOn,
    RefundAmount,
    records_id,
  ]);
  return result;
};

module.exports.pages = async (limit, offset) => {
  const sql = `SELECT * FROM books LIMIT ${offset}, ${limit}`;
  const [rows] = await db.query(sql);
  return rows;
};

module.exports.getTotalbooks = async () => {
  const sql = "SELECT COUNT(*) AS total FROM books";
  const [rows] = await db.execute(sql);
  return rows[0].total;
};

module.exports.checkLateRecords = async (records_id) => {
  const sql = `
    SELECT
      r.records_id,
      r.book_id,
      r.IssueDate,
      r.Status,
      u.userName,
      u.EmailID
    FROM records r
    JOIN users u
      ON r.userId = u.userId
    WHERE r.IssueDate < CURDATE()
      AND r.Status = "Pending";
  `;

  const [rows] = await db.execute(sql);
  return rows;
};
module.exports.checkLateStatus = async (records_id) => {
  const sql = `
    SELECT DISTINCT
    r.userId,
    u.userName,
    u.EmailID
    FROM records r
    JOIN users u
    ON r.userId = u.userId
    WHERE r.Status = 'Pending'
    AND CURDATE() >= DATE_ADD(r.ExpectedReturnDate, INTERVAL 5 DAY);
  `;

  const [rows] = await db.execute(sql);
  return rows;
};
module.exports.getRecordById = async (records_id) => {
  const sql = "SELECT * FROM records WHERE records_id = ?";
  const [result] = await db.execute(sql, [records_id]);
  return result;
};

module.exports.checkAvailaibleBalance = async (userId) => {
  const sql = "SELECT Balance FROM users where userId=?";
  const [result] = await db.execute(sql, [userId]);
  return result;
};

module.exports.updateBalance = async (userId, Balance) => {
  const sql = "UPDATE users SET Balance = ? WHERE userId=?";
  const [result] = await db.execute(sql, [Balance, userId]);
  return result;
};

module.exports.orderHistory = async (userId) => {
  const sql = "select * from records where userId=?";
  const [result] = await db.execute(sql, [userId]);
  return result;
};

module.exports.updateStatus = async (userId, Status) => {
  const sql = "UPDATE users SET Status = ? WHERE userId = ?";

  const [result] = await db.execute(sql, [Status, userId]);

  return result;
};

module.exports.calculateFine = async () => {
  const sql = `
    UPDATE records r
    JOIN books b ON r.book_id = b.book_id
    SET r.Charge = DATEDIFF(CURDATE(), r.IssueDate) * b.PerDayCharge
    WHERE r.Status = 'Pending'  
      AND r.IssueDate < CURDATE();
  `;

  const [result] = await db.execute(sql);
  return result;
};

module.exports.updateUser = async (recordsId) => {
  const sql = `
    UPDATE users u
    JOIN records r ON u.userId = r.userId
    SET
      u.Balance = u.Balance + IFNULL(r.RefundAmount, 0),
      u.Status = 'OK'
    WHERE r.records_id = ?;
  `;

  const [result] = await db.execute(sql, [recordsId]);
  console.log(result);
  return result;
};

module.exports.uploadFile = async (userId, imagePath) => {
  const sql = `
    UPDATE records
    SET Uploaded_Images = ?
    WHERE user_id = ?;
  `;

  const [result] = await db.execute(sql, [imagePath, userId]);
  return result;
};
