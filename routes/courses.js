var express = require("express");
var router = express.Router();
const upload = require("../utils/uploadImage");
const auth = require("../middlewares/protect");
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
  getActiveCourses,
} = require("../controllers/coursesController");

router.get("/", auth, getCourses);
router.get("/active", auth, getActiveCourses);
router.get("/:id", auth, getCourse);
router.post("/addCourse", auth, upload.single("image"), addCourse);
router.patch("/updateCourse/:id", auth, upload.single("image"), updateCourse);
router.delete("/deleteCourse/:id", auth, deleteCourse);

module.exports = router;
