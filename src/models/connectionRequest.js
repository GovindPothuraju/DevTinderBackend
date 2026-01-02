const mongoose = require('mongoose');
const  User = require('./user');

const connectionRequestSchema = new mongoose.Schema({
  fromUserId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'User'
  },
  toUserId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    red:"User"
  },
  status:{
    type:String,
    required:true,
    enum:{
      values:['interested','ignored','accepted','rejected'],
      message:"Status is not valid"
    }
  }
},{ timestamps: true });

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre('save',async function(){
  const connectionRequest=this;
  if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
    throw new Error("Cannot send connection request to oneself");
  }
  
})

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);