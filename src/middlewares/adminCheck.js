const adminAuth= (req,res,next)=>{
    console.log("Admin authentication middleware triggered");
    const token="xyz";
    const authentication= token==="xyz";
    if(!authentication){
        return res.status(403).send("Access denied. Admins only.");
    }
    next();
}

const userAuth= (req,res,next)=>{
    console.log("User authentication middleware triggered");
    const token="ac";
    const authentication= token==="abc";
    if(!authentication){
        return res.status(403).send("Access denied. Users only.");
    }
    next();
}

module.exports={adminAuth,userAuth};