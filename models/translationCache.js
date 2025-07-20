const { Schema, model } = require("mongoose");

const translationCacheSchema = new Schema({
    blogId: {
        type: Schema.Types.ObjectId,
        ref: "blog",
        required: true
    },
    targetLanguage: {
        type: String,
        required: true
    },
    translatedContent: {
        type: String,
        required: true
    },
    originalContent: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 2592000 // Cache expires after 30 days (in seconds)
    }
}, { timestamps: true });

// Compound index for efficient lookups
translationCacheSchema.index({ blogId: 1, targetLanguage: 1 }, { unique: true });

const TranslationCache = model("translationCache", translationCacheSchema);

module.exports = TranslationCache; 