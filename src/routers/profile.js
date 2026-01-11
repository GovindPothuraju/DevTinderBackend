const express=require('express');
const profileRouter=express.Router();
const validator = require("validator");
const bcrypt = require("bcrypt");


const {userAuth}=require('../middlewares/auth');
const {validateProfileUpdate}=require('../utils/validate');

// -- PROFILE ROUTER
// - GET    /profile           → View own profile
// - PATCH  /profile           → Edit profile details
// - PATCH  /profile/password  → Change password

profileRouter.get('/profile/view',userAuth,async (req,res)=>{
    
    try{
        const user=req.user;
        const safeUser = {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          photo: user.photo,
          skills: user.skills,
          age: user.age,
          gender: user.gender,
          about: user.about,
        };

        res.status(200).json(safeUser);
    }catch(err){
        res.status(401).send("Message:"+err.message);
    }
});

profileRouter.patch('/profile/edit',userAuth,async (req,res)=>{
    try{
        //Validate (throws error if invalid)
      validateProfileUpdate(req);

      //  Update logged-in user
      const loggedInUser = req.user;
      const updates = req.body;

      Object.keys(updates).forEach(key => {
        loggedInUser[key] = updates[key];
      });

      await loggedInUser.save();

      // 3️ Success response
      res.status(200).json({
        success: true,
        message: `${loggedInUser.firstName} updated successfully`,
        data: loggedInUser
      });
    }catch(err){
        res.status(400).json({
            error: "Update failed",
            message: err.message
        })
    }
});

profileRouter.patch('/profile/password',userAuth,async (req,res)=>{
  try{
    // 1 validate input
    const { oldPassword, newPassword, confirmPassword }=req.body;
    
    // 2 check if fields are provided
    if(!oldPassword || !newPassword || !confirmPassword){
      throw new Error("All fields are required");
    }
    // 3 get logged-in user
    const loggedInUser =req.user;

    // 4 check if old password matches
    const isMatch=await loggedInUser.validatePassword(oldPassword);
    if(!isMatch){
      throw new Error("Old password is incorrect");
    }
    // 5 check old password and new password are not same
    if(oldPassword===newPassword){
      throw new Error("New password must be different from old password");
    }
    //6 validate new password and confirm password match
    if(!validator.isStrongPassword(newPassword)){
      throw new Error("New password is not strong enough");
    }
    if(newPassword!==confirmPassword){
      throw new Error("New password and confirm password do not match");
    }

    // 7 hash and update password
    const hashedPassword=await bcrypt.hash(newPassword,10);
    loggedInUser.password=hashedPassword;
    await loggedInUser.save();
    res.json({
      success:`${loggedInUser.firstName}'s password updated successfully`,
        
    })
  }catch(err){
    res.json({
      error: "Password update failed",
      message: err.message
    });
  }

})
module.exports=profileRouter;
