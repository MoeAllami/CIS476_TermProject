//app/auth/forgotPassword/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import passwordRecoveryService from "@/lib/services/passwordRecoveryService";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [progress, setProgress] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Initialize the recovery process
      const result = await passwordRecoveryService.initializeRecoveryProcess(
        email
      );

      if (result.success) {
        setStep(2);
        setCurrentQuestion(result.questions[0]);
        setTotalQuestions(result.questions.length);
        setMessage("");
      } else {
        setMessage(result.message);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error starting recovery process:", error);
      setMessage("An error occurred. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityQuestionSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (!answer.trim()) {
      setMessage("Please provide an answer");
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    try {
      const result = await passwordRecoveryService.verifySecurityQuestion(
        email,
        currentQuestion.id,
        answer
      );

      if (result.success) {
        setProgress(result.progress);
        setAnswer("");

        if (result.completed) {
          // All questions verified, move to reset password
          setStep(3);
          setMessage(
            "All security questions verified. You can now reset your password."
          );
          setMessageType("success");
        } else {
          // Move to next question
          setCurrentQuestion(result.nextQuestion);
          setMessage(
            "Security question verified. Please answer the next question."
          );
          setMessageType("success");
        }
      } else {
        setMessage(result.message);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error verifying security question:", error);
      setMessage("An error occurred. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Password validation remains the same
    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters long");
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    try {
      // Check if all questions are verified
      if (!passwordRecoveryService.areAllQuestionsVerified(email)) {
        setMessage("Security verification incomplete. Please start over.");
        setMessageType("error");
        setIsLoading(false);
        return;
      }

      // Call the API endpoint instead of directly accessing MongoDB
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const result = await response.json();

      if (result.success) {
        // Reset the verification state
        passwordRecoveryService.resetVerification(email);

        setStep(4);
        setMessage("Password has been successfully reset!");
        setMessageType("success");
      } else {
        throw new Error(result.message || "Password reset failed");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage(
        "An error occurred while resetting your password. Please try again."
      );
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Password Recovery
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {step === 1 && "Enter your email to start the recovery process"}
            {step === 2 && "Answer your security questions"}
            {step === 3 && "Create a new password"}
            {step === 4 && "Your password has been reset"}
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-md ${
              messageType === "success"
                ? "bg-green-800 text-green-100"
                : "bg-red-800 text-red-100"
            }`}
          >
            {message}
          </div>
        )}

        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <button
                type="submit"
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Continue"}
              </button>
            </div>
          </form>
        )}

        {step === 2 && currentQuestion && (
          <>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${(progress / totalQuestions) * 100}%` }}
              ></div>
            </div>
            <form
              className="mt-8 space-y-6"
              onSubmit={handleSecurityQuestionSubmit}
            >
              <div>
                <label
                  htmlFor="security-question"
                  className="block text-sm font-medium text-gray-300"
                >
                  {currentQuestion.text}
                </label>
                <input
                  id="security-question"
                  name="answer"
                  type="text"
                  required
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Your answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify Answer"}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-300"
              >
                New Password
              </label>
              <input
                id="new-password"
                name="newPassword"
                type="password"
                required
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="New password (min. 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                minLength={8}
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <button
                type="submit"
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="mt-8 space-y-6">
            <p className="text-center text-gray-300">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>
            <div>
              <Link
                href="/auth/signin"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}

        <div className="text-center mt-4">
          <Link
            href="/auth/signin"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
