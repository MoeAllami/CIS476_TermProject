// app/api/cars/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import clientPromise from "@/lib/mongodb/mongodb";
import CarBuilder from "@/lib/patterns/CarBuilder";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const carData = await request.json();

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("driveshare");

    // Use the CarBuilder pattern to create and validate car object
    try {
      const carBuilder = new CarBuilder();
      const car = carBuilder
        .setOwner(session.user.id)
        .setMakeModel(carData.make, carData.model)
        .setYear(carData.year)
        .setDetails(
          carData.type,
          carData.color,
          carData.licensePlate,
          carData.mileage
        )
        .setFeatures(carData.features || [])
        .setImages(carData.photos || []) // Adjust field name if needed
        .setLocation(
          carData.location.address,
          carData.location.city,
          carData.location.state,
          carData.location.zipCode,
          carData.location.coordinates[0], // longitude
          carData.location.coordinates[1] // latitude
        )
        .setPricing(
          carData.pricePerDay,
          carData.pricing?.weekly,
          carData.pricing?.monthly,
          carData.pricing?.deposit
        )
        .setRules(
          carData.rules?.smoking,
          carData.rules?.pets,
          carData.rules?.minimumAge,
          carData.rules?.additionalRules
        )
        .setAvailability(
          carData.availability?.defaultAvailable,
          carData.availability?.exceptions
        )
        .build();

      // Insert the validated car into the database
      const result = await db.collection("cars").insertOne(car);

      if (!result.insertedId) {
        return NextResponse.json(
          { message: "Failed to create car listing" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message: "Car listing created successfully",
          carId: result.insertedId,
        },
        { status: 201 }
      );
    } catch (error) {
      // Handle validation errors from the builder
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  } catch (error) {
    console.error("Error creating car listing:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all cars (public endpoint)
export async function GET(request) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("driveshare");

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Query parameters
    const city = searchParams.get("city");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const carType = searchParams.get("type");

    // Build query
    let query = { "availability.isAvailable": true };

    if (city) {
      query["location.city"] = { $regex: city, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query["pricing.daily"] = {};
      if (minPrice) query["pricing.daily"].$gte = parseFloat(minPrice);
      if (maxPrice) query["pricing.daily"].$lte = parseFloat(maxPrice);
    }

    if (carType) {
      query.type = carType;
    }

    // Execute query with pagination
    const cars = await db
      .collection("cars")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const total = await db.collection("cars").countDocuments(query);

    return NextResponse.json({
      cars,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + cars.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching car listings:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
