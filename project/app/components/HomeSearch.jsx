"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

// Date picker components
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BookingSearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!location) {
      setError("Please enter a location");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    const searchParams = new URLSearchParams();
    searchParams.set("location", location);
    searchParams.set("startDate", startDate.toISOString());
    searchParams.set("endDate", endDate.toISOString());

    // Redirect to the available cars page with search parameters
    router.push(`/dashboard/cars?${searchParams.toString()}`);
  };

  // Handle date changes and validate
  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (endDate && date > endDate) {
      setEndDate(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-1"
    >
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row">
        <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-700">
          <label
            htmlFor="location"
            className="block text-xs text-gray-400 mb-1 text-left md:text-center"
          >
            Location
          </label>
          <div className="flex items-center">
            <FaMapMarkerAlt className="text-gray-400 mr-2" />
            <input
              id="location"
              type="text"
              placeholder="Where do you need a car?"
              className="w-full outline-none text-white bg-transparent"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-required="true"
            />
          </div>
        </div>

        <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-700">
          <label
            htmlFor="startDate"
            className="block text-xs text-gray-400 mb-1 text-left md:text-center"
          >
            Start Date
          </label>
          <div className="flex items-center">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <DatePicker
              id="startDate"
              selected={startDate}
              onChange={handleStartDateChange}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              placeholderText="Pick-up date"
              className="w-full outline-none text-white bg-transparent"
              calendarClassName="bg-gray-800 text-white border border-gray-700"
              dateFormat="MMM d, yyyy"
              aria-required="true"
            />
          </div>
        </div>

        <div className="flex-1 p-3">
          <label
            htmlFor="endDate"
            className="block text-xs text-gray-400 mb-1 text-left md:text-center"
          >
            End Date
          </label>
          <div className="flex items-center">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <DatePicker
              id="endDate"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || new Date()}
              placeholderText="Return date"
              className="w-full outline-none text-white bg-transparent"
              calendarClassName="bg-gray-800 text-white border border-gray-700"
              dateFormat="MMM d, yyyy"
              aria-required="true"
            />
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
      </form>

      {error && (
        <div className="text-red-400 text-sm p-2 text-center">{error}</div>
      )}
    </motion.div>
  );
}
