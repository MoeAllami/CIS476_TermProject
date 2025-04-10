// app/api/cars/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb/mongodb";
import { getCarById, updateCar, deleteCar } from "@/lib/services/carService";
import CarBuilder from "@/lib/patterns/CarBuilder";
import { authOptions } from "@/lib/auth/auth";
import { ObjectId } from "mongodb";

// GET a single car by ID
export async function GET(request, { params }) {
  try {
    const id = (await params).id;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("driveshare");

    // Get the car
    const car = await db.collection("cars").findOne({
      _id: new ObjectId(id),
    });

    if (!car) {
      return NextResponse.json({ message: "Car not found" }, { status: 404 });
    }

    return NextResponse.json({ car });
  } catch (error) {
    console.error("Error fetching car:", error);
    return NextResponse.json(
      { message: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

// app/api/cars/[id]/route.js
// Focus on the PUT method - I'm only showing the part that needs changes

export async function PUT(request, { params }) {
  try {
    const id = (await params).id; // Simplified - no need for await here

    // Pass authOptions to getServerSession just like in your DELETE method
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("driveshare");

    // Get the existing car directly from the database
    const existingCar = await db.collection("cars").findOne({
      _id: new ObjectId(id),
    });

    if (!existingCar) {
      return NextResponse.json(
        { success: false, message: "Car not found" },
        { status: 404 }
      );
    }

    console.log("Session user ID:", session.user.id);
    console.log("Car owner ID:", existingCar.ownerId.toString());

    // Check if user is the owner - make sure the ID comparison works correctly
    if (existingCar.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Not authorized to update this car" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Instead of using the builder pattern with selective updates,
    // create a direct update object that matches your form data structure
    const updatedCarData = {
      make: data.make,
      model: data.model,
      year: parseInt(data.year, 10),
      type: data.type,
      color: data.color,
      licensePlate: data.licensePlate,
      mileage: parseInt(data.mileage, 10),
      features: data.features || [],
      photos: data.photos || existingCar.photos || [],
      description: data.description,
      pricing: {
        daily: parseFloat(data.pricePerDay),
        // Preserve other pricing fields
        weekly: existingCar.pricing?.weekly,
        monthly: existingCar.pricing?.monthly,
        deposit: existingCar.pricing?.deposit,
      },
      location: {
        address: data.location.address,
        city: data.location.city,
        state: data.location.state,
        zipCode: data.location.zipCode,
        coordinates: data.location.coordinates || [0, 0],
      },
      availability: {
        isAvailable: data.availability.defaultAvailable,
        exceptions: existingCar.availability?.exceptions || [],
      },
      updatedAt: new Date(),
    };

    // Update in database
    const result = await db
      .collection("cars")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedCarData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to update car" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Car updated successfully",
    });
  } catch (error) {
    console.error("Error updating car:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update car",
      },
      { status: 500 }
    );
  }
}

// Delete a car
export async function DELETE(request, { params }) {
  try {
    const id = (await params).id;

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

    // Delete the car
    const result = await db.collection("cars").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Failed to delete car" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error("Error deleting car:", error);
    return NextResponse.json(
      { message: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
