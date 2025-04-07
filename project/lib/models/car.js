// lib/models/car.js
import { ObjectId } from "mongodb";
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

export const CarSchema = {
  _id: "ObjectId",
  ownerId: "ObjectId",
  make: "String",
  model: "String",
  year: "Number",
  mileage: "Number",
  pricePerDay: "Number",
  description: "String",
  features: ["String"],
  location: {
    address: "String",
    city: "String",
    state: "String",
    zipCode: "String",
    coordinates: [Number, Number], // [longitude, latitude]
  },
  photos: ["String"],
  availability: {
    defaultAvailable: "Boolean",
    exceptions: [
      {
        startDate: "Date",
        endDate: "Date",
        available: "Boolean",
      },
    ],
  },
  createdAt: "Date",
  updatedAt: "Date",
};
