const {User} = require("../model/User");

async function admin(req,res,next){
    try {
        const admin = await User.findById(req.header("x-auth-id"));
        if(!admin){
            return res.status(401).json({msg: "FORBIDDEN"});
        }
        if(admin.role!="ADMIN"){
            return res.status(401).json({ msg: "FORBIDDEN" });
        }
        next();
    } catch (error) {
        return res.status(500).json({msg: "INTERNAL SERVER ERROR"});
    }
}

module.exports = admin;