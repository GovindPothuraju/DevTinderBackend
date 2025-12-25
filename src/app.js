const express=require('express');
const app=express();

const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt=require('bcrypt');
const User=require('./models/user');

app.use(express.json());
app.use(cookieParser());

const {validateSignupData}=require('./utils/validate');
const {userAuth}=require('./middlewares/auth');

// Signup route
app.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 1️ Validate input
    await validateSignupData(req);

    // 2️ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // 3️ Hash password (secure)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4️ Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // 5️ Save to DB
    await user.save();

    // 6️ Send safe response
    res.status(201).json({
      success: true,
      message: "User signed up successfully",
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Signup failed",
    });
  }
});

// login route
app.post("/login",async (req,res)=>{

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
        res.cookie("token",jwtToken,{httpOnly:true, expires: new Date(Date.now()+3600000)});

        res.status(200).json({
        success:true,
        message:"Login successful"
        });
    }catch(err){
        res.status(400).json({
        success:false,
        message:err.message || "Login failed"
        });
    }
})

app.get('/user',userAuth,async (req,res)=>{
    
    try{
        const user=req.user;
        res.send(user);
    }catch(err){
        res.status(500).send("Message:"+err.message);
    }
});

app.patch('/user',userAuth,async (req,res)=>{
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

connectDB().then(()=>{
    console.log("Database connected successfully");
    const port=3000;
    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    })
}).catch((err)=>{
    console.log("Database connection failed",err);
});


