// app/api/bookings/[bookingId]/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb/mongodb";
import { ObjectId } from "mongodb";
import {
  getBookingById,
  updateBookingStatus,
} from "@/lib/services/bookingService";
import { getSession } from "@/lib/auth/sessionManager";
import { BookingStatus } from "@/lib/models/booking";

export async function GET(request, { params }) {
  try {
    const bookingId = params.bookingId;
    console.log("GET booking details for ID:", bookingId);

    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("driveshare");

    // Make sure we're querying with a proper ObjectId
    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(bookingId),
    });

    if (!booking) {
      console.log("Booking not found:", bookingId);
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    console.log("Found booking:", booking._id);

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch booking",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { bookingId } = (await params).bookingId;
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { status } = await request.json();
    if (!status || !Object.values(BookingStatus).includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking status",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("driveshare");

    const result = await updateBookingStatus(
      db,
      bookingId,
      status,
      session.userId
    );

    return NextResponse.json({
      success: result.success,
      data: {
        status: result.status,
      },
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update booking",
      },
      { status: 500 }
    );
  }
}
