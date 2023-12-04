import mongoose from "mongoose";

const Schema_post = new mongoose.Schema({
    title:{
        type: String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    img:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    comments:{
        type:Array
    },
    type:{
        type:String,
        require:true
    },
    size:{
        type:String,
        require:true
    }
})
export default mongoose.model('posts', Schema_post)