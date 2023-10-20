const { Organizer } = require("../model/Orgnizers");
const cloudinary = require("../utils/cloudinary");
const path = require("path");
async function addOrgnizer(req, res) {
  try {
    const media = await cloudinary.uploader.upload(
      path.resolve("./uploads", req.file.filename),
      {
        folder: "orgnizers",
      }
    );
    const orgnizer = new Organizer({
      name: req.body.name,
      role: req.body.role,
      image: media.secure_url,
    });
    await orgnizer.save();
    return res.status(201).json({ msg: "orgnizer added successfuly" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function getOrgnizers(req, res) {
  try {
    const orgnizers = await Organizer.find();
    if (!orgnizers) {
      return res.status(404).json({ msg: "no orgnizers found" });
    }
    return res.status(200).json({ data: orgnizers });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

module.exports = { addOrgnizer, getOrgnizers };
