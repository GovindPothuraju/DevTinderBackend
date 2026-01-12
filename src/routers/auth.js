
const express=require('express');
const authRouter=express.Router();

// -- 🔐 AUTHENTICATION ROUTER
// - POST /auth/signup      → Register new user
// - POST /auth/login       → Login user (JWT / session)
// - POST /auth/logout      → Logout user (clear token / session)

const {validateSignupData}=require('../utils/validate');
const User=require('../models/user');
const bcrypt=require('bcrypt');


authRouter.post("/signup",async (req, res)=>{
  try{
    //validate user data
    await validateSignupData(req);
    //check if user exists
    const {firstName,lastName,email,password}=req.body;
    const existingUser=await User.findOne({email});
    if(existingUser){
      return res.status(409).json({
        success:false,
        message:"Email already registered"
      });
    }
    // pasword hashing
    const passwordHashed = await bcrypt.hash(password,10);
    //createuser and save to db
    const newUser=new User({firstName,lastName,email,password:passwordHashed});

    const savedUser= await newUser.save();
    const token = await savedUser.getJWT();

    res.cookie("token",token,{
          httpOnly: true,
          secure: true,          // REQUIRED for Render (HTTPS)
          sameSite: "None", 
          maxAge: 3 * 24 * 60 * 60 * 1000,
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        });

    res.status(201).json({
      success:true,
      message:"User signed up successfully",
      user: {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            photo: newUser.photo,
            age:newUser.age,
            gender:newUser.gender,
            about:newUser.about
          }
    })
  }catch(err){
    res.status(400).json({
      success:false,
      message:err.message || "Signup failed"
    });
  }
})

authRouter.post("/login",async (req,res)=>{

    try{
        const {email,password}=req.body;
        //validate email
        const user=await User.findOne({email});
        if(!user){
            throw new Error("Invalid email or password");
        }
        // validate password
        const isMath=await user.validatePassword(password); // use usershema to more readable and testable
        if(!isMath){
            throw new Error("Invalid email or password");
        }
        // create a jwt token and send response
        const jwtToken = await user.getJWT(); // use userchema to more readable and testable
        //create cookie and send response
        res.cookie("token",jwtToken,{
          httpOnly: true,
          secure: true,          // REQUIRED for Render (HTTPS)
          sameSite: "None", 
          maxAge: 3 * 24 * 60 * 60 * 1000,
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        });

        res.status(200).json({
          success: true,
          message: "Login successful",
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            photo: user.photo,
            age:user.age,
            gender:user.gender,
            about:user.about
          }
        });
    }catch(err){
        res.status(400).json({
        success:false,
        message:err.message || "Login failed"
        });
    }
})

authRouter.post("/logout",async (req,res)=>{
  //res.clearCookie("token",{httpOnly:true, expires: new Date(0)});
  res.cookie("token",null,{httpOnly:true,secure: true,
    sameSite: "None", expires: new Date(Date.now())});
  res.send("Logout Sucessful");
});



module.exports=authRouter;