// app/api/cars/[id]/availability/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb/mongodb";
import {
  getCarById,
  updateCarAvailability,
  checkCarAvailability,
} from "@/lib/services/carService";

// Update car availability
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("driveshare");

    // Get the existing car to ensure owner is updating
    const existingCar = await getCarById(db, id);

    if (!existingCar) {
      return NextResponse.json(
        { success: false, message: "Car not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (existingCar.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Not authorized to update this car" },
        { status: 403 }
      );
    }

    const { isAvailable, unavailableDates } = await request.json();

    const success = await updateCarAvailability(
      db,
      id,
      session.user.id,
      isAvailable,
      unavailableDates || []
    );

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Failed to update availability" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Availability updated successfully",
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update availability" },
      { status: 500 }
    );
  }
}

// Check car availability for specific dates
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Start date and end date are required",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("driveshare");

    const isAvailable = await checkCarAvailability(
      db,
      id,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({
      success: true,
      isAvailable,
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check availability" },
      { status: 500 }
    );
  }
}
