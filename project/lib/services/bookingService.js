// lib/services/bookingService.js
import { ObjectId } from "mongodb";
import { BookingCollection, BookingStatus } from "../models/booking";
import { getCarById } from "./carService";
import { getUserById } from "../models/user";
import { createNotification } from "./notificationService";
import bookingNotificationSubject from "../patterns/observer";

export const createBooking = async (db, bookingData) => {
  // Get the car details to calculate price and get owner
  const car = await getCarById(db, bookingData.carId);
  if (!car) {
    throw new Error("Car not found");
  }

  // Calculate total price based on days and car price
  const startDate = new Date(bookingData.startDate);
  const endDate = new Date(bookingData.endDate);
  const daysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const totalPrice = daysCount * car.pricePerDay;

  // Create booking object
  const booking = {
    ...bookingData,
    ownerId: car.ownerId,
    totalPrice,
    status: BookingStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection(BookingCollection).insertOne(booking);
  const bookingId = result.insertedId;

  // Create notification for car owner
  bookingNotificationSubject.notify({
    userId: car.ownerId,
    type: "new_booking_request",
    title: "New Booking Request",
    message: `You have a new booking request for your ${car.make} ${car.model}`,
    relatedId: bookingId,
    isRead: false,
  });

  return {
    bookingId,
    totalPrice,
  };
};

export const checkCarAvailability = async (db, carId, startDate, endDate) => {
  const count = await db.collection(BookingCollection).countDocuments({
    carId: new ObjectId(carId),
    status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
    $or: [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      },
    ],
  });

  return count === 0; // Car is available if no bookings found in the date range
};

export const updateBookingStatus = async (db, bookingId, status, userId) => {
  const booking = await db.collection(BookingCollection).findOne({
    _id: new ObjectId(bookingId),
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Check authorization based on status change
  if (status === BookingStatus.CONFIRMED) {
    // Only car owner can confirm booking
    if (!booking.ownerId.equals(new ObjectId(userId))) {
      throw new Error("Unauthorized to confirm this booking");
    }
  } else if (status === BookingStatus.CANCELED) {
    // Both owner and renter can cancel
    if (
      !booking.ownerId.equals(new ObjectId(userId)) &&
      !booking.renterId.equals(new ObjectId(userId))
    ) {
      throw new Error("Unauthorized to cancel this booking");
    }
  }

  const result = await db.collection(BookingCollection).updateOne(
    { _id: new ObjectId(bookingId) },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    }
  );

  // Create appropriate notifications based on status change
  const car = await getCarById(db, booking.carId);
  let notificationData;

  if (status === BookingStatus.CONFIRMED) {
    // Notify renter that booking is confirmed
    notificationData = {
      userId: booking.renterId,
      type: "booking_confirmed",
      title: "Booking Confirmed",
      message: `Your booking for ${car.make} ${car.model} has been confirmed`,
      relatedId: booking._id,
      isRead: false,
    };
  } else if (status === BookingStatus.CANCELED) {
    // Notify the other party about cancellation
    const notifyUserId = booking.ownerId.equals(new ObjectId(userId))
      ? booking.renterId
      : booking.ownerId;

    const canceler = await getUserById(db, userId);
    const cancelerName = `${canceler.firstName} ${canceler.lastName}`;

    notificationData = {
      userId: notifyUserId,
      type: "booking_canceled",
      title: "Booking Canceled",
      message: `Booking for ${car.make} ${car.model} has been canceled by ${cancelerName}`,
      relatedId: booking._id,
      isRead: false,
    };
  }

  if (notificationData) {
    bookingNotificationSubject.notify({
      userId: car.ownerId,
      type: "new_booking_request",
      title: "New Booking Request",
      message: `You have a new booking request for your ${car.make} ${car.model}`,
      relatedId: bookingId,
      isRead: false,
    });
  }

  return {
    success: result.modifiedCount > 0,
    status,
  };
};

export const getBookingById = async (db, bookingId) => {
  return db.collection(BookingCollection).findOne({
    _id: new ObjectId(bookingId),
  });
};

export const getUserBookings = async (
  db,
  userId,
  status,
  limit = 20,
  skip = 0
) => {
  const query = {
    $or: [
      { renterId: new ObjectId(userId) },
      { ownerId: new ObjectId(userId) },
    ],
  };

  if (status) {
    query.status = status;
  }

  const bookings = await db
    .collection(BookingCollection)
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await db.collection(BookingCollection).countDocuments(query);

  return { bookings, total };
};
