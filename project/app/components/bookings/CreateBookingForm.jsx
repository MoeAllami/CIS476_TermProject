// components/bookings/CreateBookingForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CreateBookingForm({ carId, pricePerDay }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotalPrice = () => {
    const days = calculateTotalDays();
    return days * pricePerDay;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status !== "authenticated") {
      router.push(
        "/auth/signin?callbackUrl=" + encodeURIComponent(`/cars/${carId}`)
      );
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (startDate >= endDate) {
      setError("End date must be after start date");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carId,
          startDate,
          endDate,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to create booking");
      }

      // Redirect to the booking details page
      router.push(`/bookings/${data.data.bookingId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Book this car</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {status === "unauthenticated" ? (
        <div className="text-center py-4">
          <p className="mb-4">Please sign in to book this car</p>
          <button
            onClick={() =>
              router.push(
                "/auth/signin?callbackUrl=" +
                  encodeURIComponent(`/cars/${carId}`)
              )
            }
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Rental Period</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  Start Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  minDate={new Date()}
                  className="w-full p-2 border rounded"
                  placeholderText="Select start date"
                  required
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  End Date
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || new Date()}
                  className="w-full p-2 border rounded"
                  placeholderText="Select end date"
                  required
                />
              </div>
            </div>
          </div>

          {startDate && endDate && (
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <div className="flex justify-between mb-2">
                <span>Price per day:</span>
                <span>${pricePerDay}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Number of days:</span>
                <span>{calculateTotalDays()}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total price:</span>
                <span>${calculateTotalPrice()}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !startDate || !endDate}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Book Now"}
          </button>
        </form>
      )}
    </div>
  );
}
