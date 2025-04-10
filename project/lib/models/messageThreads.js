// lib/models/MessageThread.js
import { Schema, model, models } from "mongoose";
import { ObjectId } from "mongodb";

const MessageThreadSchema = new Schema({
  participants: {
    type: [ObjectId],
    required: true,
    index: true,
  },
  carId: {
    type: ObjectId,
    index: true,
  },
  lastMessage: {
    type: String,
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for efficient queries
MessageThreadSchema.index({ participants: 1 });
MessageThreadSchema.index({ lastMessageAt: -1 });

export default models.MessageThread ||
  model("MessageThread", MessageThreadSchema);
