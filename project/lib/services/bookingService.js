// lib/services/bookingService.js
import { ObjectId } from "mongodb";
import { BookingCollection, BookingStatus } from "../models/booking";
import { getCarById } from "./carService";
import { getUserById } from "../models/user";
import { createNotification } from "./notificationService";
import bookingNotificationSubject from "../patterns/observer";

const calculateBookingPrice = (car, startDate, endDate) => {
  // Calculate the number of days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Get base price per day
  const pricePerDay = car.pricing?.daily || car.pricePerDay;

  // Apply weekly or monthly rates if applicable
  if (car.pricing && car.pricing.monthly && diffDays >= 30) {
    // Monthly rate
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    return months * car.pricing.monthly + remainingDays * pricePerDay;
  } else if (car.pricing && car.pricing.weekly && diffDays >= 7) {
    // Weekly rate
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    return weeks * car.pricing.weekly + remainingDays * pricePerDay;
  } else {
    // Daily rate
    return diffDays * pricePerDay;
  }
};

export const createBooking = async (db, bookingData) => {
  // Get the car details to calculate price and get owner
  console.log("Creating booking with data:", bookingData);

  // Check if the car exists
  const car = await db.collection("cars").findOne({
    _id: new ObjectId(bookingData.carId.toString()),
  });

  if (!car) {
    throw new Error("Car not found");
  }

  // Prepare booking data
  const booking = {
    carId: new ObjectId(bookingData.carId.toString()),
    renterId: new ObjectId(bookingData.renterId.toString()),
    ownerId: new ObjectId(car.ownerId.toString()),
    startDate: new Date(bookingData.startDate),
    endDate: new Date(bookingData.endDate),
    totalPrice: calculateBookingPrice(
      car,
      bookingData.startDate,
      bookingData.endDate
    ),
    status: BookingStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log("Creating booking with:");
  console.log("- renterId:", bookingData.renterId.toString());
  console.log("- car ownerId (raw):", car.ownerId);
  console.log(
    "- car ownerId (as ObjectId):",
    new ObjectId(car.ownerId.toString())
  );

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
  console.log("Inserting booking with renterId:", booking.renterId);
  return {
    bookingId: result.insertedId,
    totalPrice: booking.totalPrice,
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
    bookingNotificationSubject.notify(notificationData);
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
  limit = 10,
  skip = 0
) => {
  console.log("Getting bookings for user:", userId, "with status:", status);

  // Create the query - look for bookings where user is either the renter or owner
  const userObjectId = new ObjectId(userId.toString());

  // Create the query - look for bookings where user is either the renter or owner
  const query = {
    $or: [{ renterId: userObjectId }, { ownerId: userObjectId }],
  };

  // Add status filter if provided
  if (status) {
    query.status = status;
  }

  console.log("Bookings query:", JSON.stringify(query));

  // Get the bookings
  const bookings = await db
    .collection("bookings")
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  console.log(`Found ${bookings.length} bookings`);

  // For each booking, get the car details and add them to the booking
  const bookingsWithCars = await Promise.all(
    bookings.map(async (booking) => {
      try {
        const car = await db.collection("cars").findOne({
          _id: booking.carId,
        });

        return {
          ...booking,
          car: car || { make: "Unknown", model: "Unknown" },
        };
      } catch (err) {
        console.error("Error getting car for booking:", err);
        return booking;
      }
    })
  );

  // Get total count for pagination
  const total = await db.collection("bookings").countDocuments(query);

  return { bookings: bookingsWithCars, total };
};
