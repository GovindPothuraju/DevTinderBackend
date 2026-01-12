const express= require('express');
const mongoose = require('mongoose');
const userRouter=express.Router();

const {userAuth}= require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const USER_SAFE_DATA =
  "firstName lastName gender skills age photo about";
const User=require("../models/user");
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
    }).populate('fromUserId',['firstName','lastName','photo','about']);

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

userRouter.get('/users/connections',userAuth,async (req,res)=>{
  try{

    const loggedInUser=req.user;
    const connectionRequests=await ConnectionRequest.find({
      $or:[{fromUserId:loggedInUser._id ,status:"accepted"},{toUserId:loggedInUser._id,status:"accepted"}]
    }).populate("fromUserId",USER_SAFE_DATA).populate("toUserId",USER_SAFE_DATA);

    const data=connectionRequests.map(row => {
      if(row.fromUserId._id.equals(loggedInUser._id)){
        return row.toUserId;
      }
      return row.fromUserId;
    })

    return res.json({data});

  }catch(err){
      res.status(500).json({
        success: false,
        message: "Invalid connection request: " + err.message
      });
    }
})

userRouter.get('/feed', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id },
        { toUserId: loggedInUser._id }
      ]
    }).select("fromUserId toUserId");

    const hideUserFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUserFeed.add(req.fromUserId.toString());
      hideUserFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      _id: {
        $ne: loggedInUser._id,
        $nin: Array.from(hideUserFeed)
      }
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports=userRouter;