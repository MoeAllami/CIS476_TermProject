// components/bookings/BookingList.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { BookingStatus } from "@/lib/models/booking";
import { formatDate } from "@/lib/utils/dateUtils";

export default function BookingList({ bookings }) {
  const [expandedBooking, setExpandedBooking] = useState(null);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case BookingStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case BookingStatus.CONFIRMED:
        return "bg-green-100 text-green-800";
      case BookingStatus.CANCELED:
        return "bg-red-100 text-red-800";
      case BookingStatus.COMPLETED:
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleExpand = (bookingId) => {
    if (expandedBooking === bookingId) {
      setExpandedBooking(null);
    } else {
      setExpandedBooking(bookingId);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking._id}
          className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleExpand(booking._id)}
          >
            <div className="flex-1">
              <h3 className="font-medium">
                {booking.car?.make} {booking.car?.model} ({booking.car?.year})
              </h3>
              <p className="text-sm text-gray-600">
                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                  booking.status
                )}`}
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </span>

              <span className="font-medium">${booking.totalPrice}</span>

              <svg
                className={`w-5 h-5 transition-transform ${
                  expandedBooking === booking._id ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {expandedBooking === booking._id && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Booking Details</h4>
                  <p className="text-sm">Booking ID: {booking._id}</p>
                  <p className="text-sm">
                    Created: {formatDate(booking.createdAt)}
                  </p>
                  <p className="text-sm">Total Price: ${booking.totalPrice}</p>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <h4 className="font-medium mb-2">Actions</h4>
                    <div className="flex gap-2">
                      <Link
                        href={`/bookings/${booking._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </Link>

                      {booking.status === BookingStatus.PENDING && (
                        <Link
                          href={`/cars/${booking.carId}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Car
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
