// components/payments/PaymentButton.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentButton({ bookingId, amount, isPaid = false }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handlePayment = async () => {
    if (isPaid) return;

    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          amount,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Payment failed");
      }

      // Refresh the page to show updated status
      router.refresh();

      // Show success message
      alert("Payment processed successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isPaid) {
    return (
      <button
        disabled
        className="bg-green-500 text-white px-4 py-2 rounded opacity-75 cursor-not-allowed"
      >
        Paid
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`${
          isProcessing ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        } text-white px-4 py-2 rounded transition-colors`}
      >
        {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
