const {Test} = require("../model/test");
const cloudinary = require("../utils/cloudinary");
const multer = require('multer');

async function upload(req, res, next) {
  try {
    console.log("../uploads/"+req.file.filename);
    const result = await cloudinary.uploader.upload(
    "../IEEE API/uploads/profile.jpg",
      {
        folder: "members",
      }
    );
    const user = new Test({
      name: req.body.name,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });
    await user.save();
    res.status(200).json({msg: "success"})
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

module.exports = { upload };
