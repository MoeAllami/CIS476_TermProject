// app/api/cars/search/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb/mongodb";
import { searchCars } from "@/lib/services/carService";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse search parameters
    const params = {
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      priceMin: searchParams.get("priceMin")
        ? Number(searchParams.get("priceMin"))
        : undefined,
      priceMax: searchParams.get("priceMax")
        ? Number(searchParams.get("priceMax"))
        : undefined,
      make: searchParams.get("make"),
      model: searchParams.get("model"),
      year: searchParams.get("year")
        ? Number(searchParams.get("year"))
        : undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
      skip: searchParams.get("skip") ? Number(searchParams.get("skip")) : 0,
    };

    // Handle location separately as it needs special formatting
    if (searchParams.get("latitude") && searchParams.get("longitude")) {
      params.location = {
        coordinates: [
          Number(searchParams.get("longitude")),
          Number(searchParams.get("latitude")),
        ],
        radius: searchParams.get("radius")
          ? Number(searchParams.get("radius"))
          : 50000,
      };
    }

    const client = await clientPromise;
    const db = client.db("driveshare");

    const { cars, total } = await searchCars(db, params);

    return NextResponse.json({
      success: true,
      data: {
        cars,
        total,
        page: Math.floor(params.skip / params.limit) + 1,
      },
    });
  } catch (error) {
    console.error("Error searching cars:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to search cars",
      },
      { status: 500 }
    );
  }
}
