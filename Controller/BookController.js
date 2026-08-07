const db = require("../config/db");
const {
  insertBook,
  updateBookAvailability,
  pages,
  getTotalbooks,
} = require("../model/libraryModel");
const {
  checkBookIdExists,
  checkBookNameExists,
} = require("../model/bookValidationModel");
const { generateBookId } = require("../utils/generateIds");

const { generate_token } = require("../middleware/authMiddleware");

module.exports.bookRegistration = async (req, res) => {
  try {
    const { name, book_name, book_theme, author, available, Cost } = req.body;
    const book_id = await generateBookId();
    const existingId = await checkBookIdExists(book_id);
    if (existingId && existingId.length > 0) {
      return res.status(400).json({
        message: "Book Id already exists",
      });
    }
    const existingName = await checkBookNameExists(book_name);
    if (existingName && existingName.length > 0) {
      return res.status(400).json({
        message: "Book already exists",
      });
    }

    const calculateBookPerDayCost = (Cost * 7.5) / 100;

    const PerDayCharge = calculateBookPerDayCost;

    await insertBook({
      book_id,
      book_name,
      book_theme,
      author,
      available: "Y",
      Cost,
      PerDayCharge,
    });
    return res.status(201).json({
      data: {
        book_id,
        book_name,
        book_theme,
        author,
        available,
        Cost,
        PerDayCharge,
      },
    });
  } catch (error) {
    console.error("User registration error:", error);
    return res.status(500).json({
      message: "Database insertion failed",
    });
  }
};

module.exports.updateBook = async (req, res) => {
  try {
    const { book_id } = req.body;
    await updateBookAvailability(book_id, "N");
    res.status(200).json({
      book_id,
      message: "record updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: error,
    });
  }
};

module.exports.Records = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const totalBooks = await getTotalbooks();

    const total_pages = Math.ceil(totalBooks / limit);

    const records = await pages(limit, offset);

    res.status(200).json({
      page,
      limit,
      totalBooks,
      total_pages,
      data: records,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
