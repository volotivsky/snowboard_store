import mongoose from "mongoose";

const Schema_user = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique: true
    },
    password:{
        type:String,
        require:true
    },
    favorite:{
        type: Array
    },
    korzina:{
        type:Array
    }
})

export default mongoose.model('users', Schema_user)