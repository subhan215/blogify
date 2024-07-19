const { Schema, model } = require("mongoose");

const messageSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId , 
        required: true , 
        ref: "user"
    } , 
    senderName: {
        type: String
    } , 
    recipientId: {
        type: Schema.Types.ObjectId , 
        ref: "user" , 
        required: true , 
    } , 
    content: {
        type: String , 
        required: true
    }  , 
    delivered: {
        type:  Boolean , 
        default: false
    }
} , {timestamps: true})

const Message = model("message" , messageSchema)

module.exports = Message