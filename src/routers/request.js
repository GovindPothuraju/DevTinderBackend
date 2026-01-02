const express=require('express');
const mongoose = require('mongoose');
const requestRouter=express.Router();
const {userAuth}= require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

// -- connection request router
// - POST   /requests/send/interested/:userId/   → Send interest || → I sent a request to Ravi
// - POST   /requests/send/ignore/:userId       → Ignore user   || → I ignored Ravi


requestRouter.post('/request/send/:status/:userId',userAuth,async(req,res)=>{
  try{

    const fromUserId=req.user._id;
    const toUserId=req.params.userId;
    const status=req.params.status; 

    // check userId is valid
    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({
        success:false,
        message:"Invalid userId format"
      });
    }

    // Validate status
    const validStatuses=['interested','ignored'];
    if(!validStatuses.includes(status)){
      return res.status(400).json({
        success:false,
        message:"Invalid status value"
      });
    }
    //check if target user is in the database
    const targetUserInDB = await User.findOne({_id:toUserId});
    if(!targetUserInDB){
      return res.status(404).json({
        success:false,
        message:"Target user not found"
      })
    }
    // check if a request already exists between the users
    const existingRequest=await ConnectionRequest.findOne({ // this must be stored in index for fast searching
      $or:[
        {fromUserId,toUserId},
        {fromUserId:toUserId,toUserId:fromUserId}
      ]
    })
    if(existingRequest){
      return res.status(400).json({
        success:false,
        message:"A connection request already exists between these users"
      });
    }
    //check self-request
    if (fromUserId.toString() === toUserId) {
      return res.status(400).json({
        success:false,
        message:"You cannot send request to yourself"
      });
    }
    // Create new connection request
    const newRequest=new ConnectionRequest({fromUserId,toUserId,status});
    await newRequest.save();

    res.status(200).json({
      success:true,
      message:`${req.user.firstName} has ${status} ${targetUserInDB.firstName} successfully`
    });

  }catch(err){
    res.status(500).json({
      success:false,
      message:"Internal server error "+err.message
    });
  }
});

requestRouter.post('/request/review/:status/:requestId',userAuth,async (req,res)=>{
  try{

    const {status,requestId}=req.params;
    const loggedInUserId=req.user._id;
    // validate status
    const validateStatuses=['accepted','rejected'];
    if(!validateStatuses.includes(status)){
      return res.status(400).json({message:"Invalid status value",success:false});
    }
    // you can only accept / reject request when somone definitly interested in you 
    const connectionRequest=await ConnectionRequest.findOne({
      _id:requestId,
      toUserId:loggedInUserId,
      status:'interested'
    });
    if(!connectionRequest){
      return res.status(404).json({message:"No pending interested connection request found",success:false});
    }
    // update the connection request status
    connectionRequest.status=status;

    await connectionRequest.save();

    res.status(200).json({
      success:true,
      message:`Connection request has been ${status} successfully`
    });

  }catch(err){
    res.status(500).json({
      success:false,
      message:"Internal server error "+err.message
    });
  }
});

module.exports=requestRouter;