// app/api/cars/[id]/availability/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import clientPromise from "@/lib/mongodb/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(request, context) {
  try {
    // Get the ID from the URL params using the context object
    const id = context.params?.id;

    if (!id) {
      return NextResponse.json(
        { message: "Car ID is required" },
        { status: 400 }
      );
    }

    // Get the request body
    const { isAvailable } = await request.json();

    // Get session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("driveshare");

    // Get the car to check ownership
    const car = await db.collection("cars").findOne({
      _id: new ObjectId(id),
    });

    if (!car) {
      return NextResponse.json({ message: "Car not found" }, { status: 404 });
    }

    // Verify the user owns this car
    if (car.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized: You do not own this car" },
        { status: 403 }
      );
    }

    // Update the car availability
    const result = await db.collection("cars").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          "availability.isAvailable": isAvailable,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Failed to update car availability" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Car availability updated successfully",
      isAvailable,
    });
  } catch (error) {
    console.error("Error updating car availability:", error);
    return NextResponse.json(
      { message: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
