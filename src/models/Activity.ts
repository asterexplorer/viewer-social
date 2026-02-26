import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
    userId: String,
    username: String,
    type: {
        type: String,
        enum: ['LIKE', 'COMMENT', 'SAVE', 'VIEW'],
        required: true
    },
    targetId: String, // Post ID or Shot ID
    targetType: {
        type: String,
        enum: ['POST', 'SHOT'],
        required: true
    },
    content: String, // Comment text or other metadata
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Use existing model if it exists, else create new one
export const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
