const express=require('express');

const app=express();



app.get('/test',(req,res)=>{
    
    res.send('get request called');
})

app.post('/test/:userId',(req,res)=>{
    res.send(req.params);
})

const port=3000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})