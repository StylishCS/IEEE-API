var express = require("express");
var router = express.Router();
const upload = require("../utils/uploadImage");
const auth = require("../middlewares/protect");
const { getCourses, addCourse } = require("../controllers/coursesController");

router.get("/", auth, getCourses);
router.post("/addCourse", auth, upload.single("image"), addCourse);

module.exports = router;
