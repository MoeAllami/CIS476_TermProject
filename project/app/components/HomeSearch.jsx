// components/HomeSearch.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Date picker components - you can install react-datepicker for this
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function HomeSearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();

    const searchParams = new URLSearchParams();
    if (location) searchParams.set("location", location);
    if (startDate) searchParams.set("startDate", startDate.toISOString());
    if (endDate) searchParams.set("endDate", endDate.toISOString());

    router.push(`/dashboard/cars?${searchParams.toString()}`);
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
            className="block text-xs text-gray-400 mb-1 text-center"
          >
            Location
          </label>
          <div className="flex items-center">
            <input
              id="location"
              type="text"
              placeholder="Where do you need a car?"
              className="w-full outline-none text-white bg-transparent text-center"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-700">
          <label
            htmlFor="startDate"
            className="block text-xs text-gray-400 mb-1 text-center"
          >
            Start Date
          </label>
          <div className="flex items-center justify-center">
            <DatePicker
              id="startDate"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              placeholderText="Pick-up date"
              className="w-full outline-none text-white bg-transparent text-center"
              calendarClassName="bg-gray-800 text-white border border-gray-700"
            />
          </div>
        </div>

        <div className="flex-1 p-3">
          <label
            htmlFor="endDate"
            className="block text-xs text-gray-400 mb-1 text-center"
          >
            End Date
          </label>
          <div className="flex items-center justify-center">
            <DatePicker
              id="endDate"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || new Date()}
              placeholderText="Return date"
              className="w-full outline-none text-white bg-transparent text-center"
              calendarClassName="bg-gray-800 text-white border border-gray-700"
            />
          </div>
        </div>

        <button
          type="submit"
          className="m-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center"
        >
          <span>Search</span>
        </button>
      </form>
    </motion.div>
  );
}
