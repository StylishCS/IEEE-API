const { User } = require("../model/User");

async function editor(req, res, next) {
  try {
    const editor = await User.findById(req.header("x-auth-id"));
    if (!editor) {
      return res.status(401).json({ msg: "FORBIDDEN" });
    }
    if (editor.role == "USER") {
      return res.status(401).json({ msg: "FORBIDDEN" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

module.exports = editor;
