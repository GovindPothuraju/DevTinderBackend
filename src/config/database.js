const mongoose=require('mongoose');

const connectDB =async ()=>{
  await mongoose.connect(`mongodb+srv://dbuser:qPAcPuFEFNPItKUa@devtinder.ix9cqnf.mongodb.net/devTinder`);
}

module.exports=connectDB;