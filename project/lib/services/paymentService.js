// lib/services/paymentService.js
import { ObjectId } from "mongodb";
import paymentProxy from "../patterns/proxy/paymentProxy";
import bookingNotificationSubject from "../patterns/observer";
import { getBookingById, updateBookingStatus } from "./bookingService";
import { BookingStatus } from "../models/booking";

export const PaymentCollection = "payments";

export const createPayment = async (db, paymentData) => {
  // Get booking details to verify payment amount
  const booking = await getBookingById(db, paymentData.bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== BookingStatus.CONFIRMED) {
    throw new Error("Cannot process payment for unconfirmed booking");
  }

  // Verify payment amount matches booking total
  if (paymentData.amount !== booking.totalPrice) {
    throw new Error("Payment amount does not match booking price");
  }

  // Process payment through proxy
  const paymentResult = await paymentProxy.processPayment({
    ...paymentData,
    payerId: booking.renterId,
    receiverId: booking.ownerId,
  });

  // Create payment record
  const payment = {
    bookingId: new ObjectId(paymentData.bookingId),
    payerId: booking.renterId,
    receiverId: booking.ownerId,
    amount: booking.totalPrice,
    status: "completed",
    transactionId: paymentResult.transactionId,
    createdAt: new Date(),
  };

  const result = await db.collection(PaymentCollection).insertOne(payment);

  // Update booking status to PAID
  await updateBookingStatus(
    db,
    paymentData.bookingId,
    BookingStatus.PAID,
    paymentData.userId
  );

  // Notify both parties about the payment
  // Notify renter
  bookingNotificationSubject.notify({
    userId: booking.renterId,
    type: "payment_completed",
    title: "Payment Completed",
    message: `Your payment of $${booking.totalPrice} for booking #${booking._id} has been processed successfully.`,
    relatedId: booking._id,
    isRead: false,
  });

  // Notify owner
  bookingNotificationSubject.notify({
    userId: booking.ownerId,
    type: "payment_received",
    title: "Payment Received",
    message: `You have received a payment of $${booking.totalPrice} for booking #${booking._id}.`,
    relatedId: booking._id,
    isRead: false,
  });

  return {
    paymentId: result.insertedId,
    transactionId: paymentResult.transactionId,
    status: "completed",
  };
};

export const getPaymentByBookingId = async (db, bookingId) => {
  return db.collection(PaymentCollection).findOne({
    bookingId: new ObjectId(bookingId),
  });
};

export const getUserPayments = async (db, userId, limit = 20, skip = 0) => {
  const query = {
    $or: [
      { payerId: new ObjectId(userId) },
      { receiverId: new ObjectId(userId) },
    ],
  };

  const payments = await db
    .collection(PaymentCollection)
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await db.collection(PaymentCollection).countDocuments(query);

  return { payments, total };
};
