// lib/services/notificationService.js
import { ObjectId } from "mongodb";

export const NotificationCollection = "notifications";

export const createNotification = async (db, notificationData) => {
  const notification = {
    ...notificationData,
    createdAt: new Date(),
    isRead: false,
  };

  const result = await db
    .collection(NotificationCollection)
    .insertOne(notification);
  return result.insertedId;
};

export const markNotificationAsRead = async (db, notificationId, userId) => {
  const result = await db.collection(NotificationCollection).updateOne(
    {
      _id: new ObjectId(notificationId),
      userId: new ObjectId(userId),
    },
    {
      $set: {
        isRead: true,
      },
    }
  );

  return result.modifiedCount > 0;
};

export const getUserNotifications = async (
  db,
  userId,
  limit = 20,
  skip = 0
) => {
  const notifications = await db
    .collection(NotificationCollection)
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await db
    .collection(NotificationCollection)
    .countDocuments({ userId: new ObjectId(userId) });

  const unreadCount = await db
    .collection(NotificationCollection)
    .countDocuments({ userId: new ObjectId(userId), isRead: false });

  return { notifications, total, unreadCount };
};
