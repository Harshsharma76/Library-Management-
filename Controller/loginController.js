const { checkUserExists } = require("../model/userValidationModel");
const { generate_token } = require("../middleware/authMiddleware");
const bcrypt = require("bcrypt");

module.exports.loginValidation = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const users = await checkUserExists(userId);

    if (users.length === 0) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }

    return res.status(200).json({
      message: "Login Successful",

      user: userId,
      token: await generate_token({
        userId: user.userId,
        EmailID: user.EmailID,
      }),
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};
