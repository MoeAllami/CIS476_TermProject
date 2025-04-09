// lib/models/securityQuestions.js
import { ObjectId } from "mongodb";

export const SecurityQuestionsCollection = "securityQuestions";

/**
 * Get all active security questions
 * @param {Object} db - MongoDB database instance
 * @returns {Promise<Array>} - Array of security questions
 */
export const getActiveSecurityQuestions = async (db) => {
  return db
    .collection(SecurityQuestionsCollection)
    .find({ isActive: true })
    .toArray();
};

/**
 * Get a security question by ID
 * @param {Object} db - MongoDB database instance
 * @param {string} questionId - The ID of the security question
 * @returns {Promise<Object>} - The security question
 */
export const getSecurityQuestionById = async (db, questionId) => {
  return db
    .collection(SecurityQuestionsCollection)
    .findOne({ _id: new ObjectId(questionId) });
};

/**
 * Create a new security question
 * @param {Object} db - MongoDB database instance
 * @param {string} question - The security question text
 * @returns {Promise<Object>} - The created security question
 */
export const createSecurityQuestion = async (db, question) => {
  const result = await db.collection(SecurityQuestionsCollection).insertOne({
    question,
    isActive: true,
    createdAt: new Date(),
  });

  return {
    _id: result.insertedId,
    question,
    isActive: true,
    createdAt: new Date(),
  };
};

/**
 * Update a security question's status
 * @param {Object} db - MongoDB database instance
 * @param {string} questionId - The ID of the security question
 * @param {boolean} isActive - Whether the question is active
 * @returns {Promise<Object>} - The update result
 */
export const updateSecurityQuestionStatus = async (
  db,
  questionId,
  isActive
) => {
  return db
    .collection(SecurityQuestionsCollection)
    .updateOne({ _id: new ObjectId(questionId) }, { $set: { isActive } });
};
