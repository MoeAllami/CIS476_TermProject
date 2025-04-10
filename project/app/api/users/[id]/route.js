// app/api/users/[id]/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const id = (await params).id;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("driveshare");

    // Get the user
    const user = await db.collection("users").findOne({
      _id: new ObjectId(id),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Return user data (excluding sensitive information)
    const safeUser = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImage: user.profileImage,
    };

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
