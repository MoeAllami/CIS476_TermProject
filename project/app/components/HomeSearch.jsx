"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaSearch, FaMapMarkerAlt, FaCar, FaDollarSign } from "react-icons/fa";

export default function CarSearch() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [carType, setCarType] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!city) {
      setError("Please enter a location");
      return;
    }

    const searchParams = new URLSearchParams();
    searchParams.set("city", city);

    // Add optional parameters if they are set
    if (minPrice) searchParams.set("minPrice", minPrice);
    if (maxPrice) searchParams.set("maxPrice", maxPrice);
    if (carType) searchParams.set("type", carType);

    // Redirect to the car search results page
    router.push(`/cars?${searchParams.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-1"
    >
      <form onSubmit={handleSearch}>
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-700">
            <label
              htmlFor="city"
              className="block text-xs text-gray-400 mb-1 text-left md:text-center"
            >
              Location
            </label>
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-gray-400 mr-2" />
              <input
                id="city"
                type="text"
                placeholder="Where do you need a car?"
                className="w-full outline-none text-white bg-transparent"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-required="true"
              />
            </div>
          </div>

          <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-700">
            <label
              htmlFor="type"
              className="block text-xs text-gray-400 mb-1 text-left md:text-center"
            >
              Car Type
            </label>
            <div className="flex items-center">
              <FaCar className="text-gray-400 mr-2" />
              <select
                id="type"
                value={carType}
                onChange={(e) => setCarType(e.target.value)}
                className="w-full outline-none text-white bg-transparent"
              >
                <option value="">All Types</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="truck">Truck</option>
                <option value="coupe">Coupe</option>
                <option value="convertible">Convertible</option>
                <option value="van">Van</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="m-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center"
            aria-label="Search for available cars"
          >
            <FaSearch className="mr-2" />
            <span>Find Cars</span>
          </button>
        </div>

        <div className="text-center text-gray-400 pb-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-blue-400 hover:text-blue-300 text-sm focus:outline-none"
          >
            {expanded ? "Hide price filters" : "Show price filters"}
          </button>
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 gap-4 p-4 border-t border-gray-700"
          >
            <div>
              <label
                htmlFor="minPrice"
                className="block text-xs text-gray-400 mb-1"
              >
                Min Price
              </label>
              <div className="flex items-center bg-gray-700 bg-opacity-30 rounded p-2">
                <FaDollarSign className="text-gray-400 mr-1" />
                <input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  min="0"
                  className="w-full outline-none text-white bg-transparent"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="maxPrice"
                className="block text-xs text-gray-400 mb-1"
              >
                Max Price
              </label>
              <div className="flex items-center bg-gray-700 bg-opacity-30 rounded p-2">
                <FaDollarSign className="text-gray-400 mr-1" />
                <input
                  id="maxPrice"
                  type="number"
                  placeholder="Any"
                  min="0"
                  className="w-full outline-none text-white bg-transparent"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="text-red-400 text-sm p-2 text-center">{error}</div>
        )}
      </form>
    </motion.div>
  );
}
