//lib/patterns/chain-of-responsibility
/**
 * Base Handler class for the Chain of Responsibility pattern
 */
class SecurityQuestionHandler {
  constructor(db) {
    this.nextHandler = null;
    this.db = db;
  }

  /**
   * Set the next handler in the chain
   * @param {SecurityQuestionHandler} handler - The next handler in the chain
   * @returns {SecurityQuestionHandler} - The next handler for method chaining
   */
  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }

  /**
   * Process the security question and answer
   * @param {Object} request - The request containing the email, question ID and answer
   * @returns {Promise<boolean>} - Whether the answer is correct
   */
  async handle(request) {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }

    return true; // End of chain reached successfully
  }

  /**
   * Validate the answer for this specific security question
   * @param {Object} request - The request containing the email, question ID and answer
   * @returns {Promise<boolean>} - Whether the answer is correct
   */
  async validateAnswer(request) {
    throw new Error("validateAnswer method must be implemented by subclasses");
  }
}

/**
 * Security Question Handler implementation
 */
class UserSecurityQuestionHandler extends SecurityQuestionHandler {
  constructor(db, questionId) {
    super(db);
    this.questionId = questionId;
  }

  async handle(request) {
    // Check if this is the handler's question
    if (request.questionId === this.questionId) {
      const isValid = await this.validateAnswer(request);
      if (!isValid) {
        return false;
      }
    }

    // Pass to the next handler if it exists
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }

    return true;
  }

  async validateAnswer(request) {
    const { verifySecurityQuestionAnswer } = await import("../models/user");
    // Use the user model to verify the answer
    return verifySecurityQuestionAnswer(
      this.db,
      request.email,
      this.questionId,
      request.answer
    );
  }
}

export { SecurityQuestionHandler, UserSecurityQuestionHandler };
