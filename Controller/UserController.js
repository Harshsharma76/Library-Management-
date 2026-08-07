const { generateRecordId, generateUserId } = require("../utils/generateIds");
const { insertUser, updateRecords } = require("../model/libraryModel");
const {
  updateBookAvailability,
  insertRecord,
  getRecordById,
  updateBalance,
  checkAvailaibleBalance,
  orderHistory,
  updateUser,
} = require("../model/libraryModel");

const {
  checkUserExists,
  checkEmailExists,
  checkPhoneNoExists,
} = require("../model/userValidationModel");

const { bookRegistration } = require("../Controller/BookController");

const {
  checkBookIdExists,
  checkBookAvailability,
  getBooksInfo,
} = require("../model/bookValidationModel");

const bcrypt = require("bcrypt");

const util = require("../utils/util");
const { json } = require("express");

module.exports.registerUser = async (req, res) => {
  try {
    const { userName, phoneNo, EmailID, password, Balance, Status } = req.body;
    const userId = await generateUserId();
    const existingUser = await checkUserExists(userId);
    // console.log(existingUser);
    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({
        message: "userId already exists",
      });
    }
    const existingPhoneNo = await checkPhoneNoExists(phoneNo);
    if (existingPhoneNo && existingPhoneNo.length > 0) {
      return res.status(400).json({
        message: "PhoneNo already exists",
      });
    }
    const existingEmail = await checkEmailExists(EmailID);
    if (existingEmail && existingEmail.length > 0) {
      return res.status(400).json({
        message: "emailId already exists",
      });
    }

    const hashed_password = await bcrypt.hash(req.body.password, 10);

    const result = await insertUser({
      userId,
      userName,
      phoneNo,
      EmailID,
      password: hashed_password,
      role: "Visitor",
      Balance,
      Status: "OK",
    });

    res.status(201).json({
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
};
module.exports.IssueBook = async (req, res) => {
  try {
    const { book_id } = req.body;
    const userId = req.user.userId;

    const records_id = await generateRecordId();
    console.log(records_id);
    const user = await checkUserExists(userId);
    if (!user || user.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    // const records = records[0];
    const book = await checkBookIdExists(book_id);
    // console.log(Cost);
    if (!book || book.length === 0) {
      return res.status(404).json({
        message: "Book not found",
      });
    }
    const Cost = book[0].Cost;
    const users = await checkAvailaibleBalance(userId);
    const Balance = users[0].Balance;
    console.log(Balance);
    if (Balance < Cost) {
      return res.status(403).json({
        message:
          "You Can't issue the following book because you have insufficient Balance",
      });
    }
    const availability = await checkBookAvailability(book_id);
    if (availability.length === 0 || availability[0].available === "N") {
      return res.status(400).json({
        message: "Book is already issued",
      });
    }
    const IssueDate = new Date();
    const ExpectedReturnDate = new Date(IssueDate);
    ExpectedReturnDate.setDate(ExpectedReturnDate.getDate() + 7);
    const updatedBalance = Balance - Cost;
    console.log(updatedBalance);
    await updateBalance(userId, updatedBalance);
    await insertRecord({
      records_id,
      userId: userId,
      book_id,
      IssueDate: IssueDate.toISOString().split("T")[0],
      ExpectedReturnDate: ExpectedReturnDate.toISOString().split("T")[0],
      Charge: 0,
      Status: "Pending",
      RefundAmount: 0,
    });
    await updateBookAvailability(book_id, "N");
    return res.status(200).json({
      message: "Book issued successfully",
      records_id,
    });
  } catch (error) {
    console.error("ERROR STACK:");
    console.error(error.stack);

    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports.ReturnBook = async (req, res) => {
  try {
    const { records_id, book_id } = req.body;

    if (!records_id || !book_id) {
      return res.status(400).json({
        message: "records_id and book_id are required",
      });
    }

    const records = await getRecordById(records_id);

    if (records.length === 0) {
      return res.status(404).json({
        message: "Record not found",
      });
    }

    const record = records[0];
    if (record.Status != "Pending") {
      return res.status(400).json({
        message: "Cannot Return The Book Again",
      });
    }
const books = await getBooksInfo(book_id);

console.log("book_id:", book_id);
console.log("books:", books);
    const book = books[0];
    console.log(book)

    const ReturnedOn = new Date().toISOString().split("T")[0];

    const expectedDate = new Date(record.ExpectedReturnDate);
    const returnedDate = new Date(ReturnedOn);

    let RefundAmount = 0;

    const graceDate = new Date(expectedDate);
    graceDate.setDate(graceDate.getDate() + 5);

    if (returnedDate <= graceDate) {
      RefundAmount = book.Cost - record.Charge;
    }

    await updateRecords(
      records_id,
      "Returned",
      record.Charge,
      ReturnedOn,
      RefundAmount,
    );

    await updateUser(records_id, RefundAmount);

    await updateBookAvailability(book_id, "Y");

    return res.status(200).json({
      message: "Book returned successfully.",
      ReturnedOn,
      RefundAmount,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
module.exports.userInfo = async (req, res) => {
  try {
    const user = req.user;
    const redisKey = `user:${user.userId}`;

    const cachedData = await util.get_redis_key(redisKey);
    console.log(cachedData);
    if (cachedData) {
      return res.status(200).json({
        user_info: JSON.parse(cachedData),
      });
    }

    const userInfo = await checkUserExists(user.userId);

    if (!userInfo.length) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const data = {
      userId: userInfo[0].userId,
      userName: userInfo[0].userName,
      EmailID: userInfo[0].EmailID,
    };

    await util.set_redis_key(redisKey, JSON.stringify(data));

    console.log("User cached in Redis");

    return res.status(200).json({
      user_info: data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error while fetching data.",
    });
  }
};

module.exports.addUserBalance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { Balance } = req.body;

    const user = await checkUserExists(userId);

    if (!user || user.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!Balance) {
      return res.status(400).json({
        message: "Balance is required",
      });
    }

    const result = await checkAvailaibleBalance(userId);
    const currentBalance = result[0].Balance;

    const updatedBalance = currentBalance + Number(Balance);

    await updateBalance(userId, updatedBalance);

    return res.status(200).json({
      message: "Balance added successfully",
      userId,
      previousBalance: currentBalance,
      updatedBalance,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports.orderHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await checkUserExists(userId);

    if (!user || user.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const data = await orderHistory(userId);
    return res.status(200).json({
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports.defaulters = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await checkUserExists(userId);

    if (!user || user.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: user[0].Status,
      message:
        user[0].Status === "Defaulter"
          ? "You are marked as a defaulter."
          : "You are not a defaulter.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
