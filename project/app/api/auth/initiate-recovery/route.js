// app/api/auth/initiate-recovery/route.js
import { NextResponse } from "next/server";
import { getDbClient } from "@/lib/mongodb_server";
import { getUserByEmail } from "@/lib/models/user";

export async function POST(request) {
  try {
    const { email } = await request.json();
    const { db } = await getDbClient();
    const user = await getUserByEmail(db, email);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.securityQuestions || user.securityQuestions.length < 3) {
      return NextResponse.json({
        success: false,
        message: "Security questions not set up for this user",
      });
    }

    // Return security questions without answers
    const questions = user.securityQuestions.map((q) => ({
      id: q.questionId || q.question,
      text: q.question,
    }));

    return NextResponse.json({
      success: true,
      message: "Recovery process initialized",
      questions: questions,
    });
  } catch (error) {
    console.error("Error initializing recovery:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred",
      },
      { status: 500 }
    );
  }
}
