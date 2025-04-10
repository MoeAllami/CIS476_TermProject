// app/api/user/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Singleton pattern for authentication
import { AuthManager } from "@/lib/auth/AuthManager";

export async function GET() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    // Get user data from session using the Singleton pattern
    const user = await AuthManager.getInstance().getUserFromSession(
      sessionToken
    );

    if (!user) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    // Return the user information (except sensitive data like password)
    const { password, securityQuestions, ...userData } = user;

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
