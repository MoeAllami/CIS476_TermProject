// lib/models/user.js
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export const UserCollection = "users";

export const getUserById = async (db, userId) => {
  return db.collection(UserCollection).findOne({ _id: new ObjectId(userId) });
};

export const getUserByEmail = async (db, email) => {
  return db.collection(UserCollection).findOne({ email });
};

/**
 * Set security questions and answers for a user
 * @param {Object} db - MongoDB database instance
 * @param {string} userId - The user ID
 * @param {Array} securityQuestions - Array of security question objects
 * @returns {Promise<Object>} - The update result
 */
export const setUserSecurityQuestions = async (
  db,
  userId,
  securityQuestions
) => {
  // Hash the answers before storing
  const hashedQuestions = await Promise.all(
    securityQuestions.map(async (q) => ({
      questionId: q.questionId,
      question: q.question,
      answer: await bcrypt.hash(q.answer.toLowerCase().trim(), 10),
    }))
  );

  return db.collection(UserCollection).updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        securityQuestions: hashedQuestions,
        updatedAt: new Date(),
      },
    }
  );
};

/**
 * Verify a user's security question answer
 * @param {Object} db - MongoDB database instance
 * @param {string} email - The user's email
 * @param {string} questionId - The ID of the question
 * @param {string} answer - The provided answer
 * @returns {Promise<boolean>} - Whether the answer is correct
 */
export const verifySecurityQuestionAnswer = async (
  db,
  email,
  questionId,
  answer
) => {
  const user = await getUserByEmail(db, email);

  if (!user || !user.securityQuestions) {
    return false;
  }

  const question = user.securityQuestions.find(
    (q) => q.questionId === questionId || q.question === questionId
  );

  if (!question) {
    return false;
  }

  // Compare the provided answer with the stored hash
  return bcrypt.compare(answer.toLowerCase().trim(), question.answer);
};

/**
 * Update a user's password
 * @param {Object} db - MongoDB database instance
 * @param {string} email - The user's email
 * @param {string} newPassword - The new password
 * @returns {Promise<Object>} - The update result
 */
export const updateUserPassword = async (db, email, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  return db.collection(UserCollection).updateOne(
    { email },
    {
      $set: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    }
  );
};

// Additional helper functions for user operations
