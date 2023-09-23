const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    file: {
      type: String,
      required: false,
    },
    deadline: {
      type: String,
      required: true,
    },
    active:{
      type: Boolean,
      default: true,
    },
    submits: {
      type: Array,
      required: false,
      default: [],
    },
    points: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", TaskSchema);

exports.Task = Task;
