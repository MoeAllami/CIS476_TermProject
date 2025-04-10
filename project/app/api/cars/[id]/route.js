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

// Update a car
export async function PUT(request, { params }) {
  try {
    const id = (await params).id;
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

    const data = await request.json();

    // Use the Builder pattern to update car
    const carBuilder = new CarBuilder().setOwner(session.user.id);

    // Only update fields that are provided
    if (data.make && data.model) carBuilder.setMakeModel(data.make, data.model);
    if (data.year) carBuilder.setYear(data.year);
    if (data.type || data.color || data.licensePlate || data.mileage) {
      carBuilder.setDetails(
        data.type || existingCar.type,
        data.color || existingCar.color,
        data.licensePlate || existingCar.licensePlate,
        data.mileage || existingCar.mileage
      );
    }
    if (data.features) carBuilder.setFeatures(data.features);
    if (data.images) carBuilder.setImages(data.images);
    if (data.location) {
      carBuilder.setLocation(
        data.location.address || existingCar.location.address,
        data.location.city || existingCar.location.city,
        data.location.state || existingCar.location.state,
        data.location.zipCode || existingCar.location.zipCode,
        data.location.longitude ||
          existingCar.location.coordinates.coordinates[0],
        data.location.latitude ||
          existingCar.location.coordinates.coordinates[1]
      );
    }
    if (data.pricing) {
      carBuilder.setPricing(
        data.pricing.daily || existingCar.pricing.daily,
        data.pricing.weekly || existingCar.pricing.weekly,
        data.pricing.monthly || existingCar.pricing.monthly,
        data.pricing.deposit || existingCar.pricing.deposit
      );
    }
    if (data.rules) {
      carBuilder.setRules(
        data.rules.smoking !== undefined
          ? data.rules.smoking
          : existingCar.rules.smoking,
        data.rules.pets !== undefined
          ? data.rules.pets
          : existingCar.rules.pets,
        data.rules.minimumAge || existingCar.rules.minimumAge,
        data.rules.additionalRules || existingCar.rules.additionalRules
      );
    }
    if (data.availability !== undefined) {
      carBuilder.setAvailability(
        data.availability.isAvailable !== undefined
          ? data.availability.isAvailable
          : existingCar.availability.isAvailable,
        data.availability.unavailableDates ||
          existingCar.availability.unavailableDates
      );
    }

    // Build the updated car data
    const updatedCarData = carBuilder.build();

    // Remove the owner ID and ratings from update (these shouldn't be modified)
    delete updatedCarData.ownerId;
    delete updatedCarData.ratings;
    delete updatedCarData.createdAt;

    // Update in database
    const success = await updateCar(db, id, updatedCarData);

    if (!success) {
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
