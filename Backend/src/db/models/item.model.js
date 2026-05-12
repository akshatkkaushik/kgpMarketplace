const mongoose=require('mongoose')

const itemSchema=new mongoose.Schema({
    category:String,
    img_src:[{
        url:String,
        is_thumbnail:{
            type:Boolean,
            default:false
        }
    }],
    name:String,
    price:Number,
    listed_by:{type:mongoose.Schema.Types.ObjectId, ref:'user'},
    list_date: Date,
    negotiable: Boolean,
    status: { type: String, enum: ['available', 'sold'], default: 'available' }
});

// Text index for server-side name search
itemSchema.index({ name: 'text' })

const itemModel=mongoose.model('item',itemSchema)
module.exports =itemModel