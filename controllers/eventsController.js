const { Event } = require("../model/Event");
const cloudinary = require("../utils/cloudinary");
const path = require("path");
async function createEvent(req, res) {
  try {
    const media = await cloudinary.uploader.upload(
      path.resolve("./uploads", req.file.filename),
      {
        folder: "events",
      }
    );
    const event = new Event({
      name: req.body.name,
      description: req.body.description,
      date: req.body.date,
      category: req.body.category,
      image: media.secure_url,
    });
    await event.save();
    return res.status(201).json({ msg: "event added successfuly" });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function getEvents(req, res) {
  try {
    const events = await Event.find();
    if (!events) {
      return res.status(404).json({ msg: "no events available" });
    }
    return res.status(200).json({ data: events });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function getEvent(req, res) {
  try {
    const event = await Event.findById(req.body.id);
    if (!event) {
      return res.status(404).json({ msg: "event not found" });
    }
    return res.status(200).json({ data: event });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

module.exports = { createEvent, getEvent, getEvents };
