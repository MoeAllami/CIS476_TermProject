// app/api/test/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("driveshare");

    // Try to get server information to test connection
    const adminDb = client.db("admin");
    const serverInfo = await adminDb.command({ serverStatus: 1 });

    return NextResponse.json({
      status: "connected",
      message: "MongoDB connection successful",
      version: serverInfo.version,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to MongoDB",
        error: e.message,
      },
      { status: 500 }
    );
  }
}
