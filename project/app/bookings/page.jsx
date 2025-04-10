// app/bookings/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BookingList from "../components/bookings/BookingList";
import BookingFilter from "../components/bookings/BookingFilter";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "";

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const skip = (pagination.page - 1) * pagination.limit;
        const queryParams = new URLSearchParams({
          status: status,
          limit: pagination.limit,
          skip: skip,
        }).toString();

        const response = await fetch(`/api/bookings?${queryParams}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch bookings");
        }

        setBookings(data.data.bookings);
        setPagination({
          ...pagination,
          total: data.data.total,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [status, pagination.page, pagination.limit]);

  const handleStatusChange = (newStatus) => {
    const params = new URLSearchParams(searchParams);
    if (newStatus) {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }
    router.push(`/bookings?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    setPagination({
      ...pagination,
      page: newPage,
    });
  };

  if (loading && bookings.length === 0) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      <BookingFilter
        currentStatus={status}
        onStatusChange={handleStatusChange}
      />

      {bookings.length > 0 ? (
        <>
          <BookingList bookings={bookings} />

          <div className="mt-8 flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>

              <span className="px-4 py-1">
                Page {pagination.page} of{" "}
                {Math.ceil(pagination.total / pagination.limit) || 1}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.limit)
                }
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You don't have any bookings yet.</p>
          <button
            onClick={() => router.push("/cars")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Find Cars to Rent
          </button>
        </div>
      )}
    </div>
  );
}
