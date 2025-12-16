const express=require('express');

const app=express();

app.use('/test',(req,res)=>{
    res.send('hello from govind');
})

const port=7777;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})