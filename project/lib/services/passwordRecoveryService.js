// lib/services/passwordRecoveryService.js
class PasswordRecoveryClient {
  constructor() {
    this.userVerificationState = new Map();
  }

  async initializeRecoveryProcess(email) {
    try {
      const response = await fetch("/api/auth/initiate-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success && result.questions) {
        // Store state client-side
        this.userVerificationState.set(email, {
          verifiedQuestions: [],
          allQuestionsVerified: false,
          questions: result.questions,
        });
      }

      return result;
    } catch (error) {
      console.error("Error initializing recovery:", error);
      return {
        success: false,
        message: "An error occurred while initializing the recovery process",
      };
    }
  }

  async verifySecurityQuestion(email, questionId, answer) {
    try {
      const userState = this.userVerificationState.get(email);

      if (!userState) {
        return {
          success: false,
          message: "Recovery process not initialized",
        };
      }

      // Call API to verify
      const response = await fetch("/api/auth/verify-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, questionId, answer }),
      });

      const result = await response.json();

      if (result.success) {
        // Update client-side state
        userState.verifiedQuestions.push(questionId);

        // Check if all questions are verified
        if (userState.verifiedQuestions.length === userState.questions.length) {
          userState.allQuestionsVerified = true;
        }

        return {
          success: true,
          message: "Security question verified successfully",
          progress: userState.verifiedQuestions.length,
          total: userState.questions.length,
          completed: userState.allQuestionsVerified,
          nextQuestion: this.getNextQuestion(userState),
        };
      }

      return result;
    } catch (error) {
      console.error("Error verifying security question:", error);
      return {
        success: false,
        message: "An error occurred while verifying the security question",
      };
    }
  }

  getNextQuestion(userState) {
    if (userState.allQuestionsVerified) {
      return null;
    }

    const nextQuestion = userState.questions.find(
      (q) => !userState.verifiedQuestions.includes(q.id)
    );

    return nextQuestion || null;
  }

  areAllQuestionsVerified(email) {
    const userState = this.userVerificationState.get(email);
    return userState && userState.allQuestionsVerified;
  }

  resetVerification(email) {
    this.userVerificationState.delete(email);
  }

  getFirstQuestion(email) {
    const userState = this.userVerificationState.get(email);
    return userState && userState.questions.length > 0
      ? userState.questions[0]
      : null;
  }
}

// Create a singleton instance
const passwordRecoveryClient = new PasswordRecoveryClient();

export default passwordRecoveryClient;
