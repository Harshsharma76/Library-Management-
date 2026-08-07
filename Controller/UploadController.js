const libraryModel = require("../model/libraryModel");

exports.uploadFile = async (req, res) => {
  try {
    const { userId } = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a file.",
      });
    }

    await libraryModel.uploadFile(user_id, req.file.path);

    res.status(200).json({
      message: "File uploaded successfully.",
      file: req.file,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
