// components/messaging/ContactOwnerButton.jsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ContactOwnerButton({ ownerId, carId }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContact = async (e) => {
    e.preventDefault();

    if (!session) {
      router.push(`/auth/signin?callbackUrl=${window.location.pathname}`);
      return;
    }

    if (session.user.id === ownerId) {
      alert("You cannot message yourself");
      return;
    }

    if (!message.trim()) return;

    try {
      setLoading(true);
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: ownerId,
          content: message,
          carId: carId,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      setIsModalOpen(false);
      router.push(`/messages/${data.message.threadId}`);
    } catch (error) {
      console.error("Error contacting owner:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Contact Owner
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Contact the Owner</h2>
            <form onSubmit={handleContact}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Hi, I'm interested in renting your car..."
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  disabled={loading || !message.trim()}
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
