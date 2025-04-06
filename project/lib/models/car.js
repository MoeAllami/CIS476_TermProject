// lib/models/car.js
export const CarCollection = "cars";

export const getCarById = async (db, carId) => {
  return db.collection(CarCollection).findOne({ _id: new ObjectId(carId) });
};

export const getCarsByOwner = async (db, ownerId) => {
  return db
    .collection(CarCollection)
    .find({ ownerId: new ObjectId(ownerId) })
    .toArray();
};

// Additional car-related helper functions
