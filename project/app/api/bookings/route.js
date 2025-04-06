// app/api/bookings/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb/mongodb";
import {
  createBooking,
  checkCarAvailability,
} from "@/lib/services/bookingService";

export async function POST(request) {
  try {
    const { carId, startDate, endDate, ...bookingData } = await request.json();

    const client = await clientPromise;
    const db = client.db("driveshare");

    // Check if the car is available for the requested dates
    const isAvailable = await checkCarAvailability(
      db,
      carId,
      new Date(startDate),
      new Date(endDate)
    );

    if (!isAvailable) {
      return NextResponse.json(
        {
          success: false,
          message: "Car is not available for the selected dates",
        },
        { status: 409 }
      );
    }

    // Create the booking
    const bookingId = await createBooking(db, {
      carId: new ObjectId(carId),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      ...bookingData,
    });

    return NextResponse.json({
      success: true,
      bookingId,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create booking",
      },
      { status: 500 }
    );
  }
}
