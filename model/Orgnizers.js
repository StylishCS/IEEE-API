const mongoose = require("mongoose");

const orgnizerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const Organizer = mongoose.model("Organizer", orgnizerSchema);
exports.Organizer = Organizer;
