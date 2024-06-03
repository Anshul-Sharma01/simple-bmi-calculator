const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
    username:{
        type:String,
        unique:[true,"Username already exists"],
        required:[true,"Username is required"]
    },
    email:{
        type:String,
        unique:[true,"Email already exists"],
        required:[true,"Email must be provided"]
    },
    password:{
        type:String,
    },
    age:{
        type:String,
    },
    gender:{
        type:String
    }
});

module.exports = mongoose.model("user",userSchema);