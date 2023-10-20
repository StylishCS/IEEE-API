const { Chapter } = require("../model/ChapterPhotos");
const cloudinary = require("../utils/cloudinary");
const path = require("path");

async function addChapterPhotos(req, res) {
  const media = await cloudinary.uploader.upload(
    path.resolve("./uploads", req.file.filename),
    {
      folder: "chapter-photos",
    }
  );
  try {
    const chapterPhoto = new Chapter({
      image: media.secure_url,
    });
    await chapterPhoto.save();
    return res.status(201).json(chapterPhoto);
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function getChapterPhotos(req,res){
    try {
        const chapterPhotos = await Chapter.find();
        return res.status(200).json(chapterPhotos);
    }
    catch (error) {
        return res.status(500).json({msg: "INTERNAL SERVER ERROR"});
    }
}

module.exports = { addChapterPhotos, getChapterPhotos };
