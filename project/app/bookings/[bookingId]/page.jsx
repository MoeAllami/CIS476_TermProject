// app/bookings/[bookingId]/page.jsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookingStatus } from "@/lib/models/booking";
import { formatDate } from "../../../lib/utils/dateUtils";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useParams } from "next/navigation";

export default function BookingDetailPage() {
  const params = useParams();
  const { bookingId } = params.bookingId;
  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [owner, setOwner] = useState(null);
  const [renter, setRenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);

        // Fetch booking details
        const bookingResponse = await fetch(`/api/bookings/${bookingId}`);
        const bookingData = await bookingResponse.json();

        if (!bookingData.success) {
          throw new Error(bookingData.message || "Failed to fetch booking");
        }

        setBooking(bookingData.data);

        // Fetch car details
        const carResponse = await fetch(`/api/cars/${bookingData.data.carId}`);
        const carData = await carResponse.json();

        if (carData.success) {
          setCar(carData.data);
        }

        // Fetch owner and renter details
        const ownerResponse = await fetch(
          `/api/users/${bookingData.data.ownerId}`
        );
        const ownerData = await ownerResponse.json();

        if (ownerData.success) {
          setOwner(ownerData.data);
        }

        const renterResponse = await fetch(
          `/api/users/${bookingData.data.renterId}`
        );
        const renterData = await renterResponse.json();

        if (renterData.success) {
          setRenter(renterData.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const updateBookingStatus = async (newStatus) => {
    try {
      setUpdating(true);

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update booking");
      }

      // Update the booking status in the state
      setBooking({
        ...booking,
        status: newStatus,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!booking) {
    return <div className="text-center p-4">Booking not found</div>;
  }

  const isOwner = booking.ownerId === localStorage.getItem("userId");
  const isRenter = booking.renterId === localStorage.getItem("userId");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/bookings" className="text-blue-600 hover:text-blue-800">
          ← Back to Bookings
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold">Booking Details</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === BookingStatus.PENDING
                  ? "bg-yellow-100 text-yellow-800"
                  : booking.status === BookingStatus.CONFIRMED
                  ? "bg-green-100 text-green-800"
                  : booking.status === BookingStatus.CANCELED
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Car Information</h2>
              {car ? (
                <div>
                  <p className="text-xl font-medium">
                    {car.make} {car.model} ({car.year})
                  </p>
                  {car.photos && car.photos.length > 0 && (
                    <img
                      src={car.photos[0]}
                      alt={`${car.make} ${car.model}`}
                      className="mt-2 rounded-lg w-full h-48 object-cover"
                    />
                  )}
                  <div className="mt-4">
                    <p className="text-gray-600">
                      <span className="font-medium">Price per day:</span> $
                      {car.pricePerDay}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Location:</span>{" "}
                      {car.location.city}, {car.location.state}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Car information not available</p>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">
                Booking Information
              </h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Booking ID:</span> {booking._id}
                </p>
                <p>
                  <span className="font-medium">Rental Period:</span>{" "}
                  {formatDate(booking.startDate)} to{" "}
                  {formatDate(booking.endDate)}
                </p>
                <p>
                  <span className="font-medium">Total Price:</span> $
                  {booking.totalPrice}
                </p>
                <p>
                  <span className="font-medium">Created:</span>{" "}
                  {formatDate(booking.createdAt)}
                </p>

                {isOwner && renter && (
                  <div className="mt-4">
                    <p className="font-medium">Renter:</p>
                    <p>
                      {renter.firstName} {renter.lastName}
                    </p>
                    <p>{renter.email}</p>
                  </div>
                )}

                {isRenter && owner && (
                  <div className="mt-4">
                    <p className="font-medium">Owner:</p>
                    <p>
                      {owner.firstName} {owner.lastName}
                    </p>
                    <p>{owner.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>

            <div className="flex flex-wrap gap-3">
              {isOwner && booking.status === BookingStatus.PENDING && (
                <button
                  onClick={() => updateBookingStatus(BookingStatus.CONFIRMED)}
                  disabled={updating}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {updating ? "Processing..." : "Confirm Booking"}
                </button>
              )}

              {(isOwner || isRenter) &&
                (booking.status === BookingStatus.PENDING ||
                  booking.status === BookingStatus.CONFIRMED) && (
                  <button
                    onClick={() => updateBookingStatus(BookingStatus.CANCELED)}
                    disabled={updating}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {updating ? "Processing..." : "Cancel Booking"}
                  </button>
                )}

              {isOwner && booking.status === BookingStatus.CONFIRMED && (
                <button
                  onClick={() => updateBookingStatus(BookingStatus.COMPLETED)}
                  disabled={updating}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? "Processing..." : "Mark as Completed"}
                </button>
              )}

              <Link
                href={`/cars/${booking.carId}`}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                View Car Details
              </Link>

              {booking.status === BookingStatus.CONFIRMED && (
                <Link
                  href={`/messages?bookingId=${booking._id}`}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:bg-blue-200"
                >
                  Message {isOwner ? "Renter" : "Owner"}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
