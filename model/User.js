const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 255,
    },
    email: {
      type: String,
      required: true,
      maxlength: 255,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      maxlength: 255,
    },
    verified: {
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
    role: {
      type: String,
      enum: ["ADMIN", "EDITOR", "USER"],
      required: true,
    },
    university_code: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
      default: null,
    },
    university_year: {
      type: String,
      enum: ["FIRST","SECOND","THIRD","FORTH","FIFTH",null],
      required: false,
      default: null,
    },
    courses:{
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

async function validateUser(user) {
  try {
    const schema = Joi.object({
      name: Joi.string().max(255).required(),
      email: Joi.string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ["com", "net"] },
        })
        .required()
        .max(255),
      password: Joi.string().min(4).max(255).alphanum().required(),
    });
    return schema.validate(user, schema);
  } catch (error) {
    return { error: error };
  }
}

exports.User = User;
exports.validate = validateUser;