const { Schema, model } = require("mongoose");

const chatSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    }],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: "message"
    },
    lastMessageContent: {
        type: String,
        default: ""
    },
    lastMessageTime: {
        type: Date,
        default: Date.now
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: new Map()
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Index for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageTime: -1 });

const Chat = model("chat", chatSchema);

module.exports = Chat; 