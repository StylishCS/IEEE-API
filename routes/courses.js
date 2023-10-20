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
  submitAssignment,
  getStudentCourses,
  getCourseTasks,
  getTask,
} = require("../controllers/coursesController");

router.get("/", getCourses);
router.get("/active", getActiveCourses);
router.get("/", getCourse);
router.post("/register", auth, addStudent);
router.post("/search", searchCourse);
router.get("/tasks", auth, getTasks);
router.post("/submit", auth, upload.single("file"), submitAssignment);
router.get("/userCourses", auth, getStudentCourses);
router.get("/courseTasks", auth, getCourseTasks);
router.get("/task", auth, getTask);

module.exports = router;
