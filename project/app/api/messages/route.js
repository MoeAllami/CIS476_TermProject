// app/api/messages/route.js
import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/sessionManager";
import { sendMessage } from "@/lib/services/messagingService";

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { receiverId, content, threadId, carId } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Receiver ID and content are required" },
        { status: 400 }
      );
    }

    const message = await sendMessage(
      userId,
      receiverId,
      content,
      threadId,
      carId
    );

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
