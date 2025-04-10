// lib/services/messageService.js
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb/mongodb";
import bookingNotificationSubject from "../patterns/observer";

export const MessageCollection = "messages";
export const MessageThreadCollection = "messageThreads";

// Create a new message thread or get existing one
export const getOrCreateMessageThread = async (
  userId1,
  userId2,
  carId = null
) => {
  const client = await clientPromise;
  const db = client.db("driveshare");

  // Sort user IDs to ensure consistent thread lookup
  const participants = [userId1, userId2].sort();

  // Try to find existing thread
  let thread = await db.collection(MessageThreadCollection).findOne({
    participants: { $all: participants.map((id) => new ObjectId(id)) },
    ...(carId ? { carId: new ObjectId(carId) } : {}),
  });

  // Create new thread if none exists
  if (!thread) {
    const result = await db.collection(MessageThreadCollection).insertOne({
      participants: participants.map((id) => new ObjectId(id)),
      ...(carId ? { carId: new ObjectId(carId) } : {}),
      createdAt: new Date(),
      lastMessageAt: new Date(),
      lastMessage: null,
    });

    thread = await db.collection(MessageThreadCollection).findOne({
      _id: result.insertedId,
    });
  }

  return thread;
};

// Send a message
export const sendMessage = async (
  senderId,
  receiverId,
  content,
  threadId = null,
  carId = null
) => {
  const client = await clientPromise;
  const db = client.db("driveshare");

  // Get or create thread if not provided
  let thread;
  if (!threadId) {
    thread = await getOrCreateMessageThread(senderId, receiverId, carId);
    threadId = thread._id;
  } else {
    threadId = new ObjectId(threadId);
    thread = await db
      .collection(MessageThreadCollection)
      .findOne({ _id: threadId });
  }

  if (!thread) {
    throw new Error("Message thread not found");
  }

  // Create the message
  const message = {
    threadId,
    senderId: new ObjectId(senderId),
    receiverId: new ObjectId(receiverId),
    content,
    createdAt: new Date(),
    isRead: false,
  };

  // Insert the message
  const result = await db.collection(MessageCollection).insertOne(message);

  // Update the thread with last message info
  await db.collection(MessageThreadCollection).updateOne(
    { _id: threadId },
    {
      $set: {
        lastMessageAt: new Date(),
        lastMessage: content,
      },
    }
  );

  // Notify the receiver using Observer pattern
  bookingNotificationSubject.notify({
    userId: new ObjectId(receiverId),
    type: "NEW_MESSAGE",
    message: `You have a new message from ${senderId}`,
    relatedId: result.insertedId,
    threadId,
    senderId: new ObjectId(senderId),
  });

  return {
    ...message,
    _id: result.insertedId,
  };
};

// Get messages for a thread
export const getThreadMessages = async (threadId, limit = 50, skip = 0) => {
  const client = await clientPromise;
  const db = client.db("driveshare");

  const messages = await db
    .collection(MessageCollection)
    .find({ threadId: new ObjectId(threadId) })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  return messages;
};

// Mark messages as read
export const markMessagesAsRead = async (threadId, userId) => {
  const client = await clientPromise;
  const db = client.db("driveshare");

  const result = await db.collection(MessageCollection).updateMany(
    {
      threadId: new ObjectId(threadId),
      receiverId: new ObjectId(userId),
      isRead: false,
    },
    { $set: { isRead: true } }
  );

  return result.modifiedCount;
};

// Get user's message threads
export const getUserMessageThreads = async (userId, limit = 20, skip = 0) => {
  const client = await clientPromise;
  const db = client.db("driveshare");

  const threads = await db
    .collection(MessageThreadCollection)
    .find({ participants: new ObjectId(userId) })
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  // Get unread count for each thread
  const threadsWithCounts = await Promise.all(
    threads.map(async (thread) => {
      const unreadCount = await db
        .collection(MessageCollection)
        .countDocuments({
          threadId: thread._id,
          receiverId: new ObjectId(userId),
          isRead: false,
        });

      // Get other participant's info
      const otherParticipantId = thread.participants.find(
        (p) => p.toString() !== userId.toString()
      );

      let otherParticipant = null;
      if (otherParticipantId) {
        otherParticipant = await db
          .collection("users")
          .findOne(
            { _id: otherParticipantId },
            { projection: { name: 1, email: 1 } }
          );
      }

      return {
        ...thread,
        unreadCount,
        otherParticipant,
      };
    })
  );

  return threadsWithCounts;
};
