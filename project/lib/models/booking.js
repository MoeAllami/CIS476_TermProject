// lib/models/booking.js
export const BookingCollection = "bookings";

export const BookingStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELED: "canceled",
  COMPLETED: "completed",
};

export const BookingSchema = {
  _id: "ObjectId",
  carId: "ObjectId",
  renterId: "ObjectId",
  ownerId: "ObjectId",
  startDate: "Date",
  endDate: "Date",
  totalPrice: "Number",
  status: "String", // pending, confirmed, canceled, completed
  paymentId: "ObjectId", // Reference to payment (optional)
  createdAt: "Date",
  updatedAt: "Date",
};
