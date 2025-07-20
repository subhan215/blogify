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
    chatId: {
        type: Schema.Types.ObjectId,
        ref: "chat",
        required: true
    },
    content: {
        type: String , 
        required: true
    }  , 
    delivered: {
        type:  Boolean , 
        default: false
    },
    read: {
        type: Boolean,
        default: false
    }
} , {timestamps: true})

// Index for efficient querying
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, recipientId: 1 });

const Message = model("message" , messageSchema)

module.exports = Message