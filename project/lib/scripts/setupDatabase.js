// scripts/setupDatabase.js

import { MongoClient } from "mongodb";

const setupDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please add MONGODB_URI to your environment variables");
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("driveshare");

    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    const requiredCollections = [
      "users",
      "cars",
      "bookings",
      "messages",
      "messageThreads",
      "notifications",
      "payments",
      "reviews",
      "securityQuestions",
    ];

    for (const collection of requiredCollections) {
      if (!collectionNames.includes(collection)) {
        await db.createCollection(collection);
        console.log(`Created collection: ${collection}`);
      }
    }

    // Set up indexes

    // Users collection indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ userId: 1 });
    console.log("Created index on users.email");

    // Cars collection indexes
    await db
      .collection("cars")
      .createIndex({ "location.coordinates": "2dsphere" });
    await db.collection("cars").createIndex({ ownerId: 1 });
    console.log("Created indexes on cars collection");

    // Bookings collection indexes
    await db
      .collection("bookings")
      .createIndex({ carId: 1, startDate: 1, endDate: 1 });
    await db.collection("bookings").createIndex({ ownerId: 1 });
    await db.collection("bookings").createIndex({ renterId: 1 });
    console.log("Created indexes on bookings collection");

    // Messages collection indexes
    await db.collection("messages").createIndex({ threadId: 1, createdAt: 1 });
    await db.collection("messages").createIndex({ senderId: 1, receiverId: 1 });
    console.log("Created indexes on messages collection");

    // Message Threads collection indexes
    await db.collection("messageThreads").createIndex({ participants: 1 });
    await db.collection("messageThreads").createIndex({ lastMessageAt: -1 });
    console.log("Created indexes on messageThreads collection");

    // Notifications collection indexes
    await db.collection("notifications").createIndex({ userId: 1, isRead: 1 });
    await db
      .collection("notifications")
      .createIndex({ userId: 1, createdAt: -1 });
    console.log("Created indexes on notifications collection");

    // Payments collection indexes
    await db.collection("payments").createIndex({ bookingId: 1 });
    await db.collection("payments").createIndex({ payerId: 1 });
    await db.collection("payments").createIndex({ receiverId: 1 });
    console.log("Created indexes on payments collection");

    // Reviews collection indexes
    await db.collection("reviews").createIndex({ carId: 1 });
    await db.collection("reviews").createIndex({ reviewerId: 1 });
    console.log("Created indexes on reviews collection");

    console.log("All indexes have been created successfully");
  } catch (error) {
    console.error("Error setting up indexes:", error);

    console.log("Database setup complete");
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
};

setupDatabase().catch(console.error);
