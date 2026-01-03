require("dotenv").config();
const jwt=require('jsonwebtoken');
const User=require('../models/user');

const userAuth= async (req,res,next)=>{
    const {token}= req.cookies;
    if(!token){
        return res.status(401).send("Unauthorized acess login first");
    }
    const cookie= jwt.verify(token,process.env.JWT_SECRET);
    const user= await User.findById(cookie._id);
    if(!user){
        return res.status(404).send("User not found");
    }
    req.user=user;
    next();
}

module.exports={userAuth};