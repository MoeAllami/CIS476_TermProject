// app/api/auth/reset-password/route.js
import { NextResponse } from "next/server";
import { getDbClient } from "@/lib/mongodb_server";
import { updateUserPassword } from "@/lib/models/user";

export async function POST(request) {
  try {
    const { email, newPassword } = await request.json();

    // Get database connection
    const { db } = await getDbClient();

    // Update password
    await updateUserPassword(db, email, newPassword);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, message: "Password reset failed" },
      { status: 500 }
    );
  }
}
