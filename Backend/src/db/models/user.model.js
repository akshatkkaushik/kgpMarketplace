const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    name:String,
    img_src:{type:String,required: false},
    phone:String,
    hostel:String,
    department:String
},{ timestamps: true })
const userModel=mongoose.model('user',userSchema)
module.exports =userModel