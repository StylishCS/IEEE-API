const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Chapter = mongoose.model("Chapter", chapterSchema);
exports.Chapter = Chapter;
