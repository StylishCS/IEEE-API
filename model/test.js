const Joi = require("joi");
const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
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
  },
  { timestamps: true }
);

const Test = mongoose.model("Test", testSchema);

exports.Test = Test;
