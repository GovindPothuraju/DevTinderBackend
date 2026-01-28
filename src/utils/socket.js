const socket = require("socket.io");

const initializeServer = (server)=>{
  const io= socket(server,{
    cors:{
      origin:"http://localhost:5173",
    }
  })

  io.on("connection",(socket)=>{
    console.log("New client connected",socket.id);
  })
}

module.exports={initializeServer};