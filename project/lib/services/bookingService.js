// lib/services/bookingService.js
import { ObjectId } from "mongodb";
import { BookingCollection } from "../models/booking";

export const createBooking = async (db, bookingData) => {
  const result = await db.collection(BookingCollection).insertOne({
    ...bookingData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return result.insertedId;
};

export const checkCarAvailability = async (db, carId, startDate, endDate) => {
  const count = await db.collection(BookingCollection).countDocuments({
    carId: new ObjectId(carId),
    status: { $in: ["confirmed", "pending"] },
    $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
  });

  return count === 0; // Car is available if no bookings found in the date range
};

// Other booking-related operations
