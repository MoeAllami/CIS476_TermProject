// app/api/cars/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb/mongodb";
import { getCarById, updateCar, deleteCar } from "@/lib/services/carService";
import CarBuilder from "@/lib/builders/CarBuilder";

// Get a single car by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const client = await clientPromise;
    const db = client.db("driveshare");

    const car = await getCarById(db, id);

    if (!car) {
      return NextResponse.json(
        { success: false, message: "Car not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, car });
  } catch (error) {
    console.error("Error getting car:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get car" },
      { status: 500 }
    );
  }
}

// Update a car
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

    const success = await deleteCar(db, id, session.user.id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: "Car not found or not authorized to delete",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting car:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete car" },
      { status: 500 }
    );
  }
}
