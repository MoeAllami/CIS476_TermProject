// components/bookings/CreateBookingForm.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CreateBookingForm({ carId, pricePerDay }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [existingBookingId, setExistingBookingId] = useState(null);
  const [existingBookingData, setExistingBookingData] = useState(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Calculate total price
  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Minimum 1 day
  };

  const totalDays = calculateTotalDays();
  const totalPrice = totalDays * pricePerDay;

  // Check for existing pending bookings for this car when component mounts
  useEffect(() => {
    if (session && carId) {
      checkForExistingBooking();
    }
  }, [session, carId]);

  const checkForExistingBooking = async () => {
    try {
      const response = await fetch(`/api/bookings?status=PENDING`);
      if (response.ok) {
        const data = await response.json();
        // Find a pending booking for this car
        const pendingBooking = data.data.bookings.find(
          (booking) => booking.carId === carId
        );

        if (pendingBooking) {
          console.log("Found existing pending booking:", pendingBooking);
          setExistingBookingId(pendingBooking._id);
          setExistingBookingData(pendingBooking);

          // Set dates from existing booking
          if (pendingBooking.startDate && pendingBooking.endDate) {
            setStartDate(new Date(pendingBooking.startDate));
            setEndDate(new Date(pendingBooking.endDate));
          }
        }
      }
    } catch (err) {
      console.error("Error checking for existing bookings:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status !== "authenticated") {
      router.push(
        "/auth/signin?callbackUrl=" +
          encodeURIComponent(window.location.pathname)
      );
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let bookingId = existingBookingId;
      let bookingTotalPrice = existingBookingData?.totalPrice || totalPrice;

      // Only create a new booking if we don't have an existing one
      if (!existingBookingId) {
        console.log("Creating new booking for user:", session.user.id);

        // Create booking
        const bookingResponse = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            carId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
        });

        const bookingData = await bookingResponse.json();
        console.log("Booking response:", bookingData);

        if (!bookingData.success) {
          throw new Error(bookingData.message || "Failed to create booking");
        }

        bookingId = bookingData.data.bookingId;
        bookingTotalPrice = bookingData.data.totalPrice;

        // If totalPrice is not returned from API, calculate it locally
        if (!bookingTotalPrice) {
          bookingTotalPrice = totalPrice;
        }
      }

      // Process payment - Make sure we have both ID and amount
      if (!bookingId || !bookingTotalPrice) {
        throw new Error("Missing booking details for payment");
      }

      setPaymentProcessing(true);
      console.log("Sending payment request:", {
        bookingId,
        amount: bookingTotalPrice,
        user: session.user.id,
      });

      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: bookingId,
          amount: bookingTotalPrice,
        }),
      });

      const paymentData = await paymentResponse.json();
      console.log("Payment response:", paymentData);

      if (!paymentData.success) {
        // Save the bookingId for retry
        if (!existingBookingId) {
          setExistingBookingId(bookingId);

          // Get the booking details to store totalPrice
          const bookingDetailsResponse = await fetch(
            `/api/bookings/${bookingId}`
          );
          if (bookingDetailsResponse.ok) {
            const bookingDetails = await bookingDetailsResponse.json();
            setExistingBookingData(bookingDetails.data);
          }
        }
        throw new Error(paymentData.message || "Payment failed");
      }

      // Show success message
      alert("Booking created and payment processed successfully!");

      // Redirect to bookings page
      router.push("/bookings");
    } catch (err) {
      console.error("Error in booking process:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setPaymentProcessing(false);
    }
  };

  if (status === "loading") {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Book This Car</h2>

      {existingBookingId && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700 text-sm">
            You have a pending booking for this car. Complete your payment to
            confirm.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!session && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 text-sm">
              You need to be signed in to book a car.{" "}
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/auth/signin?callbackUrl=" +
                      encodeURIComponent(window.location.pathname)
                  )
                }
                className="text-blue-600 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Pickup Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            minDate={new Date()}
            dateFormat="MMMM d, yyyy"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholderText="Select pickup date"
            required
            disabled={!!existingBookingId}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Return Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || new Date()}
            dateFormat="MMMM d, yyyy"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholderText="Select return date"
            required
            disabled={!!existingBookingId}
          />
        </div>

        {startDate && endDate && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Price Summary</h3>
            <div className="flex justify-between py-1">
              <span>
                ${pricePerDay} × {totalDays} day{totalDays !== 1 ? "s" : ""}
              </span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 font-bold border-t mt-2 pt-2">
              <span>Total</span>
              <span>
                ${(existingBookingData?.totalPrice || totalPrice).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || paymentProcessing || !session}
          className={`w-full py-2 px-4 rounded ${
            loading || paymentProcessing || !session
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading
            ? "Creating Booking..."
            : paymentProcessing
            ? "Processing Payment..."
            : existingBookingId
            ? `Complete Payment $${(
                existingBookingData?.totalPrice || totalPrice
              ).toFixed(2)}`
            : `Book & Pay $${totalPrice.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
