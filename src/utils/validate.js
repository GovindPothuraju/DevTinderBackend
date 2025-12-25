const validator = require('validator');

const validateSignupData = async (req)=>{
    // Allow only required fields
    const allowedFields = ["firstName", "lastName", "email", "password"];
    const extraFields = Object.keys(req.body).filter(
      key => !allowedFields.includes(key)
    );
    if (extraFields.length > 0) {
      throw new Error("Invalid fields provided");
    }
    const {firstName, lastName, email, password}=req.body;
    // Validate first name
    if(!firstName || firstName.trim().length<2 || firstName.trim().length>30){
        throw new Error("First name is required");
    }
    // Validate last name
    if(!lastName || lastName.trim().length<2 || lastName.trim().length>30){
        throw new Error("Last name is required");
    }
    // Validate email
    if(!email || !validator.isEmail(email)){
        throw new Error("Valid email is required");
    }
    // Validate password
    if(!password || !validator.isStrongPassword(password)){
        throw new Error("Password is not strong enough");
    }

}

module.exports= {validateSignupData};