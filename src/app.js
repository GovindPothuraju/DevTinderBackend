const express=require('express');
const connectDB = require('./config/database');

const app=express();
const User=require('./models/user');

app.post('/signup',async (req,res)=>{
    const user = new User({
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "password123",
        age: 25,
        gender: "male"
    });
    try{
        await user.save();
        res.status(201).send("User registered successfully");
    }catch(err){
        res.status(500).send("Error registering user");
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


