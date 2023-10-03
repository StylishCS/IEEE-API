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
  getTasks,
} = require("../controllers/coursesController");

router.get("/", getCourses);
router.get("/active", getActiveCourses);
router.get("/", getCourse);
router.post("/register", auth, addStudent);
router.post("/search", searchCourse);
router.get("/tasks", auth, getTasks);

module.exports = router;
