// app/api/auth/verify-question/route.js
import { NextResponse } from "next/server";
import { getDbClient } from "@/lib/mongodb_server";
import { verifySecurityQuestionAnswer } from "@/lib/models/user";

export async function POST(request) {
  try {
    const { email, questionId, answer } = await request.json();
    const { db } = await getDbClient();

    // Directly get the user and find the question
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    // Find the specific security question
    const questionObj = user.securityQuestions?.find(
      (q) => q.questionId === questionId || q.question === questionId
    );

    if (!questionObj) {
      return NextResponse.json({
        success: false,
        message: "Security question not found",
        debug: {
          availableQuestions: user.securityQuestions?.map((q) => ({
            id: q.questionId || q.question,
            text: q.question,
          })),
        },
      });
    }

    const correctAnswer = questionObj.answer;
    const isValid =
      correctAnswer.toLowerCase().trim() === answer.toLowerCase().trim();

    return NextResponse.json({
      success: isValid,
      message: isValid ? "Security question verified" : "Incorrect answer. ",
      debug: {
        userFound: !!user,
        questionFound: !!questionObj,
        providedAnswer: answer,
        correctAnswer: correctAnswer,
      },
    });
  } catch (error) {
    console.error("Error verifying question:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred: " + error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
