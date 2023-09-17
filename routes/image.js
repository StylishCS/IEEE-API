var express = require("express");
var router = express.Router();
const { upload } = require("../controllers/imageupload.js");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploads = multer({ storage: storage });

router.post("/", uploads.single("image"), upload);

module.exports = router;
