const express=require('express');
const profileRouter=express.Router();

const {userAuth}=require('../middlewares/auth');

profileRouter.get('/user',userAuth,async (req,res)=>{
    
    try{
        const user=req.user;
        res.send(user);
    }catch(err){
        res.status(500).send("Message:"+err.message);
    }
});

profileRouter.patch('/user',userAuth,async (req,res)=>{
    try{
        const user=req.user;
        const updates = req.body;
        Object.keys(updates).forEach(key => {
            user[key] = updates[key];
        });
        await user.save();
        res.send(user);
    }catch(err){
        res.status(500).send("Message:"+err.message);
    }
});
module.exports=profileRouter;