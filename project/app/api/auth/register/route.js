// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { name, email, password, securityQuestions } = await request.json();

    // Validate input
    if (
      !name ||
      !email ||
      !password ||
      !securityQuestions ||
      securityQuestions.length !== 3
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("driveshare");
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      securityQuestions,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        userId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 }
    );
  }
}
