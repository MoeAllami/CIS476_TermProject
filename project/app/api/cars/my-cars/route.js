// app/api/cars/my-cars/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import clientPromise from "@/lib/mongodb/mongodb";
import { getCarsByOwner } from "@/lib/models/car";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    // Get the session using the Singleton pattern
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("driveshare");

    // Get cars owned by the current user
    const cars = await getCarsByOwner(db, userId);

    return NextResponse.json({ cars });
  } catch (error) {
    console.error("Error fetching user cars:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
