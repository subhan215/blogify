const { Schema, model } = require("mongoose");

const notificationMsgSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId , 
        required: true , 
        ref: "user"
    } ,
    recipientId: {
        type: Schema.Types.ObjectId , 
        required: true , 
        ref: "user"
    } , 
    senderName: {
        type: String
    }
} )

const notificationMsg = model("notificationMsg" , notificationMsgSchema)

module.exports = notificationMsg