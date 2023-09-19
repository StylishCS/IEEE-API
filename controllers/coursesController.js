const { Course } = require("../model/Courses");
const cloudinary = require("../utils/cloudinary");
const path = require("path");

async function getCourses(req, res) {
  try {
    const courses = await Course.find();
    if (!courses) {
      return res.status(404).json({ msg: "no courses found.." });
    }
    return res.status(200).json({ data: courses });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function getActiveCourses(req, res) {
  try {
    const filter = {isActive: true}
    const courses = await Course.find(filter);
    if (!courses) {
      return res.status(404).json({ msg: "no courses found.." });
    }
    return res.status(200).json({ data: courses });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function getCourse(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: "no course found.." });
    }
    return res.status(200).json({ data: course });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function addCourse(req, res) {
  try {
    const result = await cloudinary.uploader.upload(
      path.resolve("./uploads", req.file.filename),
      {
        folder: "courses",
      }
    );
    const course = new Course({
      name: req.body.name,
      description: req.body.description,
      isActive: req.body.isActive,
      available: req.body.available,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });
    await course.save();
    return res
      .status(201)
      .json({ msg: "Course added successfully", data: course });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function updateCourse(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: "course not found" });
    }
    let updatedCourse;
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        path.resolve("./uploads", req.file.filename),
        {
          folder: "courses",
        }
      );
      updatedCourse = {
        name: req.body.name || course.name,
        description: req.body.description || course.description,
        isActive: req.body.isActive || course.isActive,
        available: req.body.available || course.available,
        image: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      };
    } else {
      updatedCourse = {
        name: req.body.name || course.name,
        description: req.body.description || course.description,
        isActive: req.body.isActive || course.isActive,
        available: req.body.available || course.available,
      };
    }
    await course.updateOne(updatedCourse);
    return res.status(200).json({ msg: "course updated successfuly" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function deleteCourse(req,res){
  try {
    const course = await Course.findById(req.params.id);
    if(!course){
      return res.status(404).json({msg:"course not found"});
    }
    await Course.findByIdAndDelete(req.params.id);
    return res.status(200).json({msg: "course deleted successfuly"});
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

module.exports = {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
  getActiveCourses,
};
