// lib/patterns/observer.js
import { createNotification } from "../services/notificationService";
import clientPromise from "@/lib/mongodb/mongodb";

class NotificationSubject {
  constructor() {
    this.observers = [];
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  removeObserver(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notify(data) {
    this.observers.forEach((observer) => observer.update(data));
  }
}

// Concrete observers
class EmailNotificationObserver {
  update(data) {
    // In a real implementation, this would send an email
    console.log(`Email notification sent: ${data.message} to ${data.userId}`);
    // Email sending logic would go here
  }
}

class InAppNotificationObserver {
  async update(data) {
    try {
      const client = await clientPromise;
      const db = client.db("driveshare");
      await createNotification(db, data);
    } catch (error) {
      console.error("Failed to create in-app notification", error);
    }
  }
}

// Create and configure the notification subject
const bookingNotificationSubject = new NotificationSubject();
bookingNotificationSubject.addObserver(new EmailNotificationObserver());
bookingNotificationSubject.addObserver(new InAppNotificationObserver());

export default bookingNotificationSubject;
