// lib/models/user.js
export const UserCollection = "users";

export const getUserById = async (db, userId) => {
  return db.collection(UserCollection).findOne({ _id: new ObjectId(userId) });
};

export const getUserByEmail = async (db, email) => {
  return db.collection(UserCollection).findOne({ email });
};

// Additional helper functions for user operations
