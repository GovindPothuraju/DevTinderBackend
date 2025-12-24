const express=require('express');
const connectDB = require('./config/database');

const app=express();
const User=require('./models/user');

app.use(express.json());

app.post('/signup',async (req,res)=>{
    const user = new User(req.body);
    try{
        await user.save();
        res.status(201).send("User registered successfully");
    }catch(err){
        res.status(500).send(err);
    }
})

app.get('/user',async (req,res)=>{
    const emailId=req.body.email;
    try{
        console.log("Fetching users with email:", emailId);
        const users=await User.findOne({email:emailId});
        res.send(users);
    }catch(err){
        res.status(500).send("Error fetching users");
    }
});

app.get("/feed",async (req,res)=>{
    try{
        const users=await User.find({});
        if(users.length===0){
            return res.status(404).send("No users found");
        }
        res.send(users);
    }catch(err){
        res.status(500).send("Error fetching users");
    }
})

app.delete("/user",async (req,res)=>{
    const emailId=req.body.email;
    try{
        console.log("Deleting user with email:", emailId);
        const user=await User.findOneAndDelete({email:emailId});
        if(!user){
            return res.status(404).send("User not found");
        }
        res.send("User deleted successfully");
    }catch(err){
        res.status(500).send("Error deleting user");
    }
})

app.patch("/user/:userId",async (req,res)=>{
    const data=req.body;
    const userId=req.params.userId;
    try{
        const allowed=['firstName','lastName','age','gender','photo','skills'];
        const isAllowed=Object.keys(data).every(key=>allowed.includes(key));
        if(!isAllowed){
            return res.status(400).send("Invalid fields to update");
        }
        await User.findByIdAndUpdate(userId,data,{new:true,runValidators:true});
        res.send("User updated successfully");
    }catch(err){
        res.status(500).send("Error updating user");
    }
})

connectDB().then(()=>{
    console.log("Database connected successfully");
    const port=3000;
    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    })
}).catch((err)=>{
    console.log("Database connection failed",err);
});


