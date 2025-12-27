const express=require('express');
const app=express();

const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');

const authRouter=require('./routers/auth');
const profileRouter=require('./routers/profile');

app.use(express.json());
app.use(cookieParser());


app.use('/',authRouter);
app.use('/',profileRouter);




connectDB().then(()=>{
    console.log("Database connected successfully");
    const port=3000;
    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    })
}).catch((err)=>{
    console.log("Database connection failed",err);
});


