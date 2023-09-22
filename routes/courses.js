var express = require("express");
var router = express.Router();
const upload = require("../utils/uploadImage");
const auth = require("../middlewares/protect");
const {
  getCourses,
  getCourse,
  getActiveCourses,
  addStudent,
  searchCourse,
} = require("../controllers/coursesController");

router.get("/", getCourses);
router.get("/active", getActiveCourses);
router.get("/:id", getCourse);
router.post("/register/:id", auth, addStudent);
router.post("/search", searchCourse);


module.exports = router;
