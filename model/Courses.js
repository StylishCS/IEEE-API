const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    available: {
      type: Boolean,
      required: true,
    },
    image: {
      public_id: {
        type: String,
        requird: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    students: {
      type: Array,
      default: [],
    },
    content: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

exports.Course = Course;
