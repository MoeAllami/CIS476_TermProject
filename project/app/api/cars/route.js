// app/api/cars/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb/mongodb";
import CarBuilder from "@/lib/builders/CarBuilder";
import { createCar, getCarsByOwner } from "@/lib/services/carService";

// Get all cars for the logged-in user
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("driveshare");

    const cars = await getCarsByOwner(db, session.user.id);

    return NextResponse.json({ success: true, cars });
  } catch (error) {
    console.error("Error getting cars:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get cars" },
      { status: 500 }
    );
  }
}

// Create a new car using the Builder pattern
export async function POST(request) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Use the Builder pattern to create a new car
    const carBuilder = new CarBuilder()
      .setOwner(session.user.id)
      .setMakeModel(data.make, data.model)
      .setYear(data.year)
      .setDetails(data.type, data.color, data.licensePlate, data.mileage)
      .setFeatures(data.features || [])
      .setImages(data.images || [])
      .setLocation(
        data.location.address,
        data.location.city,
        data.location.state,
        data.location.zipCode,
        data.location.longitude,
        data.location.latitude
      )
      .setPricing(
        data.pricing.daily,
        data.pricing.weekly,
        data.pricing.monthly,
        data.pricing.deposit
      )
      .setRules(
        data.rules.smoking,
        data.rules.pets,
        data.rules.minimumAge,
        data.rules.additionalRules
      )
      .setAvailability(true, data.unavailableDates || []);

    // Build the car object
    const carData = carBuilder.build();

    // Save to database
    const client = await clientPromise;
    const db = client.db("driveshare");

    const carId = await createCar(db, carData);

    return NextResponse.json(
      {
        success: true,
        message: "Car created successfully",
        carId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating car:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create car",
      },
      { status: 500 }
    );
  }
}
