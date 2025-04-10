// lib/patterns/CarBuilder.js
import { ObjectId } from "mongodb";

class CarBuilder {
  constructor() {
    this.car = {
      ownerId: null,
      make: "",
      model: "",
      year: null,
      type: "",
      color: "",
      licensePlate: "",
      mileage: null,
      features: [],
      images: [],
      availability: {
        isAvailable: true,
        unavailableDates: [],
      },
      location: {
        address: "",
        city: "",
        state: "",
        zipCode: "",
        coordinates: {
          type: "Point",
          coordinates: [0, 0], // [longitude, latitude]
        },
      },
      pricing: {
        daily: null,
        weekly: null,
        monthly: null,
        deposit: null,
      },
      rules: {
        smoking: false,
        pets: false,
        minimumAge: 21,
        additionalRules: [],
      },
      ratings: {
        average: 0,
        count: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Basic car information
  setOwner(ownerId) {
    this.car.ownerId = new ObjectId(ownerId);
    return this;
  }

  setMakeModel(make, model) {
    this.car.make = make;
    this.car.model = model;
    return this;
  }

  setYear(year) {
    this.car.year = parseInt(year);
    return this;
  }

  setDetails(type, color, licensePlate, mileage) {
    this.car.type = type;
    this.car.color = color;
    this.car.licensePlate = licensePlate;
    this.car.mileage = parseInt(mileage);
    return this;
  }

  addFeature(feature) {
    this.car.features.push(feature);
    return this;
  }

  setFeatures(features) {
    this.car.features = features;
    return this;
  }

  addImage(imageUrl) {
    this.car.images.push(imageUrl);
    return this;
  }

  setImages(imageUrls) {
    this.car.images = imageUrls;
    return this;
  }

  // Location
  setLocation(address, city, state, zipCode, longitude, latitude) {
    this.car.location = {
      address,
      city,
      state,
      zipCode,
      coordinates: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    };
    return this;
  }

  // Pricing
  setPricing(daily, weekly, monthly, deposit) {
    this.car.pricing = {
      daily: parseFloat(daily),
      weekly: parseFloat(weekly || daily * 7 * 0.9), // 10% discount by default
      monthly: parseFloat(monthly || daily * 30 * 0.8), // 20% discount by default
      deposit: parseFloat(deposit || daily * 2), // 2 days worth by default
    };
    return this;
  }

  // Rules
  setRules(smoking, pets, minimumAge, additionalRules = []) {
    this.car.rules = {
      smoking: smoking === true,
      pets: pets === true,
      minimumAge: parseInt(minimumAge || 21),
      additionalRules,
    };
    return this;
  }

  // Availability
  setAvailability(isAvailable, unavailableDates = []) {
    this.car.availability = {
      isAvailable: isAvailable === true,
      unavailableDates: unavailableDates.map((date) =>
        date instanceof Date ? date : new Date(date)
      ),
    };
    return this;
  }

  // Build the final car object
  build() {
    // Validation could be added here
    if (!this.car.ownerId) {
      throw new Error("Car must have an owner");
    }
    if (!this.car.make || !this.car.model) {
      throw new Error("Car must have make and model");
    }
    if (!this.car.year) {
      throw new Error("Car must have a year");
    }
    if (!this.car.pricing.daily) {
      throw new Error("Car must have daily pricing");
    }

    return { ...this.car };
  }
}

export default CarBuilder;
