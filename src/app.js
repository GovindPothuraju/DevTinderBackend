require("dotenv").config();
const express=require('express');
const app=express();
const cors=require("cors");

//for socket io
const http = require('http');
const { initializeServer } = require('./utils/socket');


const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');

const authRouter=require('./routers/auth');
const profileRouter=require('./routers/profile');
const requestRouter=require('./routers/request');
const userRouter=require('./routers/user');

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.json());
app.use(cookieParser());



app.use('/',authRouter);
app.use('/',profileRouter);
app.use('/',requestRouter);
app.use('/',userRouter);

app.get("/healthz", (req, res) => {
  res.status(200).send("finally you deployed backend code");
});

const server = http.createServer(app);
initializeServer(server);

connectDB().then(()=>{
    console.log("Database connected successfully");
    const port=process.env.PORT || 3000;
    server.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    })
}).catch((err)=>{
    console.log("Database connection failed",err);
});


