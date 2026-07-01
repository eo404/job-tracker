const mongoose = require("mongoose")

const jobSchema = new mongoose.Schema({
    company:{
        type:String,
        required: true
    },
    role:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:['Applied','Interview','Offer','Rejected'],
        default:'Applied'
    },
    notes:
    {
        type:String,
        default:''
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

},{timestamps:true})

module.exports = mongoose.model('Job',jobSchema)