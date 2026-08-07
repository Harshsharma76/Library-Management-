const db = require("../config/db");

module.exports.checkUserExists = async (userId, phoneNo) => {
  try {
    const sql = "select * from users where userId=?";
    const [values, feilds] = await db.query(sql, [userId, phoneNo]);
    return values;
  } catch (error) {
    return null;
  }
};

module.exports.checkEmailExists = async (EmailID) => {
  try {
    const sql = "select * from users where EmailID=?";
    const [values, feilds] = await db.query(sql, [EmailID]);
    return values;
  } catch (error) {
    return null;
  }
};

module.exports.checkPhoneNoExists = async (phoneNo) => {
  try {
    const sql = "select * from users where phoneNo=?";
    const [values, feilds] = await db.query(sql, [phoneNo]);
    return values;
  } catch (error) {
    return null;
  }
};
