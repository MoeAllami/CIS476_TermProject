// app/api/messages/threads/[threadId]/route.js
import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/sessionManager";
import {
  getThreadMessages,
  markMessagesAsRead,
} from "@/lib/services/messagingService";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb/mongodb";

export async function GET(request, { params }) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { threadId } = params;
    if (!threadId) {
      return NextResponse.json(
        { error: "Thread ID is required" },
        { status: 400 }
      );
    }

    // Verify user is a participant in this thread
    const client = await clientPromise;
    const db = client.db("driveshare");
    const thread = await db.collection("messageThreads").findOne({
      _id: new ObjectId(threadId),
      participants: new ObjectId(userId),
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found or access denied" },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const skip = parseInt(url.searchParams.get("skip") || "0");

    const messages = await getThreadMessages(threadId, limit, skip);

    // Mark messages as read
    await markMessagesAsRead(threadId, userId);

    return NextResponse.json({ messages, thread });
  } catch (error) {
    console.error("Error fetching thread messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch thread messages" },
      { status: 500 }
    );
  }
}
