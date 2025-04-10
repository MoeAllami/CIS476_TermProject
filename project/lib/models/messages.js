// lib/models/Message.js
import { Schema, model, models } from "mongoose";
import { ObjectId } from "mongodb";

const MessageSchema = new Schema({
  threadId: {
    type: ObjectId,
    required: true,
    index: true,
  },
  senderId: {
    type: ObjectId,
    required: true,
    index: true,
  },
  receiverId: {
    type: ObjectId,
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for efficient queries
MessageSchema.index({ threadId: 1, createdAt: 1 });

export default models.Message || model("Message", MessageSchema);
