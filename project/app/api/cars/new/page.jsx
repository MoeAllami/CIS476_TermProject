// app/cars/new/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const carTypes = [
  "Sedan",
  "SUV",
  "Truck",
  "Van",
  "Coupe",
  "Convertible",
  "Hatchback",
  "Wagon",
  "Other",
];
const featureOptions = [
  "Air Conditioning",
  "Bluetooth",
  "USB Ports",
  "Navigation System",
  "Backup Camera",
  "Sunroof",
  "Leather Seats",
  "Heated Seats",
  "Cruise Control",
  "Keyless Entry",
  "Remote Start",
  "Apple CarPlay",
  "Android Auto",
  "Parking Sensors",
];

function NewCarPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    type: "Sedan",
    color: "",
    licensePlate: "",
    mileage: "",
    features: [],
    images: [],
    location: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      longitude: "",
      latitude: "",
    },
    pricing: {
      daily: "",
      weekly: "",
      monthly: "",
      deposit: "",
    },
    rules: {
      smoking: false,
      pets: false,
      minimumAge: "21",
      additionalRules: [],
    },
    unavailableDates: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleFeatureChange = (feature) => {
    setFormData((prev) => {
      const features = [...prev.features];
      if (features.includes(feature)) {
        return { ...prev, features: features.filter((f) => f !== feature) };
      } else {
        return { ...prev, features: [...features, feature] };
      }
    });
  };

  const handleAdditionalRules = (e) => {
    const rules = e.target.value
      .split("\n")
      .filter((rule) => rule.trim() !== "");
    setFormData((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        additionalRules: rules,
      },
    }));
  };

  const handleImageUpload = (e) => {
    // In a real implementation, you would upload images to a storage service
    // For simplicity, we'll just simulate URLs
    const files = Array.from(e.target.files);
    const imageUrls = files.map(
      (file, index) => `https://example.com/uploads/${Date.now()}_${index}.jpg`
    );

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageUrls],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/cars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create car listing");
      }

      router.push("/dashboard/cars");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Add New Car</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Car Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make
              </label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {carTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Plate
              </label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mileage
              </label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featureOptions.map((feature) => (
              <div key={feature} className="flex items-center">
                <input
                  type="checkbox"
                  id={`feature-${feature}`}
                  checked={formData.features.includes(feature)}
                  onChange={() => handleFeatureChange(feature)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor={`feature-${feature}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {feature}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Car Images</h2>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt="Car"
                    className="h-24 w-full object-cover rounded"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index),
                      }));
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pick-up Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                name="location.state"
                value={formData.location.state}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zip Code
              </label>
              <input
                type="text"
                name="location.zipCode"
                value={formData.location.zipCode}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coordinates (optional)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="location.longitude"
                  value={formData.location.longitude}
                  onChange={handleChange}
                  placeholder="Longitude"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  name="location.latitude"
                  value={formData.location.latitude}
                  onChange={handleChange}
                  placeholder="Latitude"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Rate ($)
              </label>
              <input
                type="number"
                name="pricing.daily"
                value={formData.pricing.daily}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weekly Rate ($) (optional)
              </label>
              <input
                type="number"
                name="pricing.weekly"
                value={formData.pricing.weekly}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Defaults to 10% off daily rate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rate ($) (optional)
              </label>
              <input
                type="number"
                name="pricing.monthly"
                value={formData.pricing.monthly}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Defaults to 20% off daily rate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit ($) (optional)
              </label>
              <input
                type="number"
                name="pricing.deposit"
                value={formData.pricing.deposit}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Defaults to 2 days of rental"
              />
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smoking"
                name="rules.smoking"
                checked={formData.rules.smoking}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="smoking" className="ml-2 text-sm text-gray-700">
                Smoking allowed
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pets"
                name="rules.pets"
                checked={formData.rules.pets}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="pets" className="ml-2 text-sm text-gray-700">
                Pets allowed
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Renter Age
              </label>
              <input
                type="number"
                name="rules.minimumAge"
                value={formData.rules.minimumAge}
                onChange={handleChange}
                min="18"
                max="99"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Rules (one per line)
              </label>
              <textarea
                value={formData.rules.additionalRules.join("\n")}
                onChange={handleAdditionalRules}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="E.g., No off-road driving&#10;Return with full tank&#10;No smoking"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push("/dashboard/cars")}
            className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
export default NewCarPage;
