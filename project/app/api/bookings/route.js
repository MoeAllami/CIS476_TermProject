// app/api/bookings/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb/mongodb";
import { ObjectId } from "mongodb";
import {
  createBooking,
  checkCarAvailability,
  getUserBookings,
} from "@/lib/services/bookingService";
import { getSession } from "@/lib/auth/sessionManager";

export async function POST(request) {
  try {
    // Get user from session
    const session = await getSession(request);
    console.log("Creating booking - Session user:", session.user);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { carId, startDate, endDate } = await request.json();

    if (!carId || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

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

    // Create the booking - USE SESSION USER ID HERE
    const { bookingId, totalPrice } = await createBooking(db, {
      carId: new ObjectId(carId),
      renterId: new ObjectId(session.user.id), // Use the current user's ID
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return NextResponse.json({
      success: true,
      data: {
        bookingId,
        totalPrice,
      },
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

export async function GET(request) {
  try {
    const session = await getSession(request);
    console.log("GET bookings - Session object:", session);

    if (!session) {
      console.log("No session found - unauthorized");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Make sure we have a userId property
    const userId = session.userId || session.user?.id;

    if (!userId) {
      console.log("No user ID in session - unauthorized");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("GET bookings for user:", userId);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");

    const client = await clientPromise;
    const db = client.db("driveshare");

    const { bookings, total } = await getUserBookings(
      db,
      userId,
      status,
      limit,
      skip
    );

    console.log(`Returning ${bookings.length} bookings for user ${userId}`);
    console.log(
      "SENDING BOOKINGS:",
      JSON.stringify(
        bookings.map((b) => ({
          id: b._id,
          status: b.status,
          totalPrice: b.totalPrice,
        })),
        null,
        2
      )
    );

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        total,
        page: Math.floor(skip / limit) + 1,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bookings",
      },
      { status: 500 }
    );
  }
}
