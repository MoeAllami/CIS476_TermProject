// components/bookings/BookingFilter.jsx
"use client";

import { BookingStatus } from "@/lib/models/booking";

export default function BookingFilter({ currentStatus, onStatusChange }) {
  const statuses = [
    { value: "", label: "All Bookings" },
    { value: BookingStatus.PENDING, label: "Pending" },
    { value: BookingStatus.CONFIRMED, label: "Confirmed" },
    { value: BookingStatus.CANCELED, label: "Canceled" },
    { value: BookingStatus.COMPLETED, label: "Completed" },
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              currentStatus === status.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
}
