// lib/services/carService.js
import { ObjectId } from "mongodb";
import { CarCollection } from "../models/car";

export const getCarsByOwner = async (db, ownerId) => {
  return db
    .collection(CarCollection)
    .find({ ownerId: new ObjectId(ownerId) })
    .toArray();
};

export const createCar = async (db, carData) => {
  const result = await db.collection(CarCollection).insertOne(carData);
  return result.insertedId;
};

export const updateCar = async (db, carId, updateData) => {
  const result = await db.collection(CarCollection).updateOne(
    { _id: new ObjectId(carId) },
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    }
  );
  return result.modifiedCount > 0;
};

export const deleteCar = async (db, carId, ownerId) => {
  const result = await db.collection(CarCollection).deleteOne({
    _id: new ObjectId(carId),
    ownerId: new ObjectId(ownerId), // Ensure only owner can delete
  });
  return result.deletedCount > 0;
};

export const checkCarAvailability = async (db, carId, startDate, endDate) => {
  // First, check if the car has unavailable dates that overlap
  const car = await getCarById(db, carId);
  if (!car || !car.availability.isAvailable) {
    return false;
  }

  // Check for any unavailable dates that fall within the requested range
  const requestedStartDate = new Date(startDate);
  const requestedEndDate = new Date(endDate);

  for (const unavailableDate of car.availability.unavailableDates) {
    const date = new Date(unavailableDate);
    if (date >= requestedStartDate && date <= requestedEndDate) {
      return false;
    }
  }

  // Then check if there are any existing bookings for this period
  const bookingsCollection = db.collection("bookings");
  const existingBooking = await bookingsCollection.findOne({
    carId: new ObjectId(carId),
    status: { $in: ["pending", "confirmed"] },
    $or: [
      // Check if booking dates overlap with requested dates
      {
        startDate: { $lte: requestedEndDate },
        endDate: { $gte: requestedStartDate },
      },
    ],
  });

  return !existingBooking; // Available if no existing booking found
};

export const updateCarAvailability = async (
  db,
  carId,
  ownerId,
  isAvailable,
  unavailableDates
) => {
  const result = await db.collection(CarCollection).updateOne(
    {
      _id: new ObjectId(carId),
      ownerId: new ObjectId(ownerId), // Ensure only owner can update
    },
    {
      $set: {
        "availability.isAvailable": isAvailable,
        "availability.unavailableDates": unavailableDates.map((date) =>
          date instanceof Date ? date : new Date(date)
        ),
        updatedAt: new Date(),
      },
    }
  );
  return result.modifiedCount > 0;
};

export const searchCars = async (db, searchParams) => {
  const {
    location,
    startDate,
    endDate,
    priceMin,
    priceMax,
    make,
    model,
    year,
    limit = 20,
    skip = 0,
  } = searchParams;

  // Build query based on provided parameters
  const query = {};

  // Filter by location if provided (using geo search)
  if (location && location.coordinates) {
    const [longitude, latitude] = location.coordinates;
    const maxDistance = location.radius || 50000; // Default 50km radius

    query["location.coordinates"] = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    };
  }

  // Filter by price range
  if (priceMin !== undefined || priceMax !== undefined) {
    query.pricePerDay = {};
    if (priceMin !== undefined) query.pricePerDay.$gte = priceMin;
    if (priceMax !== undefined) query.pricePerDay.$lte = priceMax;
  }

  // Filter by car details
  if (make) query.make = make;
  if (model) query.model = model;
  if (year) query.year = year;

  // Execute the query
  const cars = await db
    .collection(CarCollection)
    .find(query)
    .skip(skip)
    .limit(limit)
    .toArray();

  // Get total count for pagination
  const total = await db.collection(CarCollection).countDocuments(query);

  // If dates provided, filter out cars that aren't available
  if (startDate && endDate) {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Get bookings that overlap with requested dates
    const bookings = await db
      .collection("bookings")
      .find({
        status: { $in: ["confirmed", "pending"] },
        $or: [
          {
            startDate: { $lte: endDateObj },
            endDate: { $gte: startDateObj },
          },
        ],
      })
      .toArray();

    // Create a Set of booked car IDs
    const bookedCarIds = new Set(bookings.map((b) => b.carId.toString()));

    // Filter out booked cars
    const availableCars = cars.filter(
      (car) => !bookedCarIds.has(car._id.toString())
    );

    return {
      cars: availableCars,
      total: availableCars.length,
    };
  }

  return { cars, total };
};

export const getCarById = async (db, carId) => {
  return db.collection(CarCollection).findOne({ _id: new ObjectId(carId) });
};
