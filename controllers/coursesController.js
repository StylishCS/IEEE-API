const { Course } = require("../model/Courses");
const { User } = require("../model/User");
const { Task } = require("../model/Task");
const cloudinary = require("../utils/cloudinary");
const path = require("path");
const { nanoid } = require("nanoid");

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
    const filter = { isActive: true };
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
    const course = await Course.findById(req.body.id);
    if (!course) {
      return res.status(404).json({ msg: "no course found.." });
    }
    return res.status(200).json({ data: course });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function searchCourse(req, res) {
  try {
    const course = await Course.find({
      name: { $regex: ".*" + req.body.name + ".*", $options: "i" },
    });
    if (!course) {
      return res.status(404).json({ msg: "course not found" });
    }
    return res.status(200).json({ data: course });
  } catch (error) {
    console.log(error);
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
    let students = course.students;
    for (let element of students) {
      const user = await User.findOne({ name: element });
      const index = user.courses.findIndex((item) => item == course.name);
      if (index !== -1) {
        user.courses[index] = updatedCourse.name;
        await user.save();
      }
    }
    await course.updateOne(updatedCourse);
    const courses = await Course.find();
    return res
      .status(200)
      .json({ msg: "course updated successfuly", data: courses });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function deleteCourse(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: "course not found" });
    }
    let students = course.students;
    console.log("students: ", students);
    for (let element of students) {
      console.log("elements: ", element);
      const user = await User.findOne({ name: element });
      console.log("user courses: ", user.courses);
      console.log("user course name: ", course.name);
      user.courses.pull(course.name);
      await user.save();
    }
    await Course.findByIdAndDelete(req.params.id);
    return res.status(200).json({ msg: "course deleted successfuly" });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function addStudent(req, res) {
  try {
    const user = await User.findById(req.body.userId);
    const course = await Course.findById(req.body.courseId);
    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }
    if (!course) {
      return res.status(404).json({ msg: "course not found" });
    }
    if (user.courses.includes(course.name)) {
      return res.status(404).json({ msg: "course is already assigned" });
    }
    user.courses.push(course.name);
    course.students.push(user.name);
    await user.save();
    await course.save();
    return res.status(200).json({ msg: "Course Added Successfuly" });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function removeStudent(req, res) {
  try {
    const user = await User.findById(req.body.id);
    const course = await Course.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }
    if (!course) {
      return res.status(404).json({ msg: "course not found" });
    }
    if (!user.courses.includes(course.name)) {
      return res.status(404).json({ msg: "course is not assigned" });
    }
    course.students.pull(user.name);
    user.courses.pull(course.name);
    await user.save();
    await course.save();
    return res.status(200).json({ msg: "Course Deleted Successfuly" });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function getCourseStudents(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: "course not found" });
    }
    let arr = [];
    for (const element of course.students) {
      const student = await User.findOne({ name: element });
      arr.push(student);
    }
    return res.status(200).json({ data: arr });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function addContent(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: "course not found" });
    }
    let media = {
      secure_url: null,
    };
    if (req.file) {
      media = await cloudinary.uploader.upload(
        path.resolve("./uploads", req.file.filename),
        {
          folder: "content",
          resource_type: "auto",
        }
      );
    }
    const content = {
      title: req.body.title,
      description: req.body.description,
      file: media.secure_url || null,
      week: req.body.week,
    };
    course.content.push(content);
    // console.log(course.content);
    course.content.sort((a, b) => {
      return a.week - b.week;
    });

    // console.log(course.content);
    await course.save();
    return res.status(200).json({ msg: "content added successfuly" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function deleteContent(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: "course not found" });
    }
    let item = course.content.find((object) => object.title === req.body.title);
    if (!item) {
      return res.status(404).json({ msg: "content not found" });
    }
    console.log(item);
    course.content.pull(item);
    await course.save();
    return res.status(200).json({ msg: "content deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function addTask(req, res) {
  try {
    let media = {
      secure_url: null,
    };
    if (req.file) {
      media = await cloudinary.uploader.upload(
        path.resolve("./uploads", req.file.filename),
        {
          folder: "tasks",
          resource_type: "auto",
        }
      );
    }
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(400).json({ msg: "course not found" });
    }
    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      file: media.secure_url,
      deadline: req.body.deadline,
      points: req.body.points,
      week: req.body.week,
      course: req.body.courseId,
    });
    await task.save();
    return res.status(201).json({ msg: "task assigned" });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function getTasks(req, res) {
  try {
    const tasks = await Task.find();
    if (!tasks) {
      return res.status(404).json({ msg: "no tasks found" });
    }
    return res.status(200).json({ data: tasks });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function getTask(req, res) {
  try {
    const task = await Task.findById(req.body.id);
    if (!task) {
      return res.status(404).json({ msg: "no tasks found" });
    }
    return res.status(200).json({ data: task });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function getCourseTasks(req, res) {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).json({ msg: "course not found" });
    }
    const tasks = await Task.find({ course: req.body.courseId });
    if (!tasks) {
      return res.status(404).json({ msg: "no tasks found" });
    }
    let sortedTasks = tasks.sort((a, b) => a.week - b.week);
    return res.status(200).json({ data: sortedTasks });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function submitAssignment(req, res) {
  try {
    const task = await Task.findById(req.body.taskId);
    if (!task) {
      return res.status(404).json({ msg: "task not found" });
    }
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ msg: "course not found" });
    }
    const media = await cloudinary.uploader.upload(
      path.resolve("./uploads", req.file.filename),
      {
        folder: "submits",
        resource_type: "auto",
      }
    );
    const id = nanoid(10);
    task.submits.push({ user: user._id, file: media.secure_url, submitId: id });
    user.submits.push({ submitId: id, status: "pending", points: 0 });
    await task.save();
    await user.save();
    return res.status(200).json({ msg: "task submitted successfuly" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function getStudentCourses(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }
    let courses = new Array();
    for (const element of user.courses) {
      const course = await Course.findOne({ name: element });
      courses.push(course);
    }
    return res.status(200).json({ data: courses });
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
  addStudent,
  removeStudent,
  getCourseStudents,
  addContent,
  deleteContent,
  searchCourse,
  addTask,
  getTasks,
  getTask,
  submitAssignment,
  getStudentCourses,
  getCourseTasks,
};
