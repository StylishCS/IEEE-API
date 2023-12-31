var express = require("express");
var router = express.Router();
const upload = require("../utils/uploadImage");
const auth = require("../middlewares/protect");
const admin = require("../middlewares/isAdmin");
const editor = require("../middlewares/isEditor");
const { addOrgnizer, getOrgnizers } = require("../controllers/addOrgnizer");
const {
  addChapterPhotos,
  getChapterPhotos,
} = require("../controllers/chapterController");
const { createEvent } = require("../controllers/eventsController");
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
  getActiveCourses,
  removeStudent,
  getCourseStudents,
  addContent,
  deleteContent,
  addTask,
} = require("../controllers/coursesController");
const { dashboardLoginController } = require("../controllers/loginController");
const {
  createEditorController,
  resetEditorPasswordController,
  updateUserAccount,
  deleteEditor,
  getEditors,
} = require("../controllers/signupController");

router.post("/login", dashboardLoginController);
router.post("/createEditor", auth, admin, createEditorController);
router.patch("/resetEditorPassword", admin, resetEditorPasswordController);
router.patch(
  "/updateEditor/:id",
  auth,
  admin,
  upload.single("image"),
  updateUserAccount
);
router.delete("/deleteEditor/:id", auth, admin, deleteEditor);
router.get("/editors", auth, admin, getEditors);

router.post("/addCourse", auth, admin, upload.single("image"), addCourse);
router.patch(
  "/updateCourse/:id",
  auth,
  editor,
  upload.single("image"),
  updateCourse
);
router.delete("/deleteCourse/:id", auth, admin, deleteCourse);
router.delete("/removeStudent/:id", auth, editor, removeStudent);
router.get("/students/:id", auth, editor, getCourseStudents);
router.post("/addContent/:id", auth, editor, upload.single("file"), addContent);
router.delete("/deleteContent/:id", auth, editor, deleteContent);
router.post("/createEvent", auth, admin, upload.single("image"), createEvent);
router.post("/addTask", auth, editor, upload.single("file"), addTask);
router.post("/addOrganizer", auth, admin, upload.single("image"), addOrgnizer);
router.get("/getOrganizers", getOrgnizers);
router.post(
  "/addChapterPhotos",
  auth,
  editor,
  upload.single("image"),
  addChapterPhotos
);
router.get("/chapterPhotos", getChapterPhotos)

module.exports = router;
