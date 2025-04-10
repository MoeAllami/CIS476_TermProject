// app/api/messages/threads/route.js
import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/sessionManager";
import { getUserMessageThreads } from "../../../../lib/services/messagingService";

export async function GET(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = parseInt(url.searchParams.get("skip") || "0");

    const threads = await getUserMessageThreads(userId, limit, skip);

    return NextResponse.json({ threads });
  } catch (error) {
    console.error("Error fetching message threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch message threads" },
      { status: 500 }
    );
  }
}
