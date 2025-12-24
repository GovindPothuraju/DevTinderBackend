const mongoose=require('mongoose');
const validator=require('validator');

const userSchema=new mongoose.Schema({
    firstName:{type :String , required:true , trim:true, minlength:2, maxlength:30},
    lastName:{type :String, required:true , trim:true, minlength:2, maxlength:30},
    email:{type :String, unique:true , required:true , trim:true, lowercase:true,validate(value){
        if(!validator.isEmail(value)){
            throw new Error("Email is not valid");
        }
    }},
    password:{type :String, required:true , minlength:6, maxlength:128, validate(value){
        if(!validator.isStrongPassword(value)){
            throw new Error("Password is not strong enough");
        }
    } },
    age:{type :Number},
    gender:{type :String , validate(value){
        if(!['male','female','other'].includes(value.toLowerCase())){
            throw new Error("Gender is not valid");
        }

    }},
    photo:{type :String,default:"https://www.example.com/default-photo.jpg", validate(value){
        if(!validator.isURL(value)){
            throw new Error("Photo must be a valid URL");
        }
    }},
    skills:{type :[String]}
},{timestamps:true})

module.exports=mongoose.model("User",userSchema);