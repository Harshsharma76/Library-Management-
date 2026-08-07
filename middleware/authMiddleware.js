const jwt = require("jsonwebtoken");
const { CheckAdmin } = require("../model/bookValidationModel");
module.exports.verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
  return null;
};

module.exports.generate_token = (userId) => {
  const token = jwt.sign(userId, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};

module.exports.verifyAdmin = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const role = await CheckAdmin(userId);
    if (!role || role !== "admin") {
      return res.status(403).json({
        message: "You cannot access this route",
      });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
