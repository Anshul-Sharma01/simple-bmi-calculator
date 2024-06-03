const mongoose = require("mongoose");
const bmiSchema = mongoose.Schema({
    email : {
        type:String,
        required:[true,'email must be required']
    },
    height:{
        type:String
    },
    weight:{
        type:String
    },
    bmi:{
        type:String
    },
    bmivalue : {
        type:String
    }

});

module.exports = mongoose.model("bmi",bmiSchema);
