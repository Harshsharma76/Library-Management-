const { Router } = require("express");
const router = Router();

// IMPORTING FUNCTIONS

const UserController = require("./Controller/UserController");
const BookController = require("./Controller/BookController");
const login = require("./Controller/loginController");
const uploadController = require("./Controller/UploadController");
const { verifyToken, verifyAdmin } = require("./middleware/authMiddleware");
const Records = require("./Controller/BookController");
const upload = require("./middleware/upload");

// ADMIN ROUTES

router.post(
  "/book-registration",
  verifyToken,
  verifyAdmin,
  BookController.bookRegistration,
);

router.post(
  "/update-Status",
  verifyToken,
  verifyAdmin,
  BookController.updateBook,
);

// USER ROUTES OR NORMAL ROUTES

router.post("/user-registration", UserController.registerUser);

router.post("/issue-book", verifyToken, UserController.IssueBook);

router.post("/return-book", verifyToken, UserController.ReturnBook);

router.post("/login", login.loginValidation);

router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  uploadController.uploadFile,
);

router.get("/order-history", verifyToken, UserController.orderHistory);

router.post("/add-balance", verifyToken, UserController.addUserBalance);

router.get("/user-info", verifyToken, UserController.userInfo);

router.get("/book-records", BookController.Records);

// USED TO EXPORT THE FUNCTION TO THE SERVER

module.exports = router;
