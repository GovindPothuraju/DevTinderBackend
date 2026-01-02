const express= require('express');
const mongoose = require('mongoose');
const userRouter=express.Router();

const {userAuth}= require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');

// -- USER ROUTER
//  - GET /users/requests/received    → Incoming requests
// - GET /users/connections   → My matches
// - GET /users/feed         → Users to swipe

userRouter.get('/users/requests/received',userAuth,async(req,res)=>{
  try{

    const loggedInUserId=req.user._id;

    // db query to get all incoming connection requests for the logged-in user
    const incomingRequests = await ConnectionRequest.find({
      toUserId: loggedInUserId,
      status: 'interested'
    }).populate('fromUserId',['firstName','lastName']);

    return res.status(200).json({
      success:true,
      data:incomingRequests
    })


  }catch(err){
    return res.status(500).json({
      success:false,
      message:"Server Error"+err.message
    })
  }
});

module.exports=userRouter;