// components/messaging/MessageThread.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";

export default function MessageThread({ threadId }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [thread, setThread] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/messages/threads/${threadId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();
      setMessages(data.messages);
      setThread(data.thread);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const otherParticipantId = thread.participants.find(
        (p) => p !== session.user.id
      );

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: otherParticipantId,
          content: newMessage,
          threadId: threadId,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setNewMessage("");
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial fetch
  useEffect(() => {
    if (session && threadId) {
      fetchMessages();

      // Set up polling for new messages
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [session, threadId]);

  if (loading && !messages.length) {
    return <div className="p-4 text-center">Loading messages...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      {thread && (
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold">
            {thread.otherParticipant?.name || "Conversation"}
          </h2>
          {thread.carId && (
            <p className="text-sm text-gray-500">About car listing</p>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.senderId === session?.user.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-lg ${
                  message.senderId === session?.user.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {formatDistanceToNow(new Date(message.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
