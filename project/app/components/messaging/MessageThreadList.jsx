// components/messaging/MessageThreadList.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default function MessageThreadList() {
  const { data: session } = useSession();
  const router = useRouter();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/messages/threads");
      if (!response.ok) throw new Error("Failed to fetch threads");

      const data = await response.json();
      setThreads(data.threads);
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchThreads();

      // Set up polling for new threads/messages
      const interval = setInterval(fetchThreads, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const handleThreadClick = (threadId) => {
    router.push(`/messages/${threadId}`);
  };

  if (loading && !threads.length) {
    return <div className="p-4 text-center">Loading conversations...</div>;
  }

  return (
    <div className="divide-y">
      {threads.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No conversations yet
        </div>
      ) : (
        threads.map((thread) => (
          <div
            key={thread._id}
            onClick={() => handleThreadClick(thread._id)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">
                  {thread.otherParticipant?.name || "User"}
                </h3>
                <p className="text-sm text-gray-600 truncate max-w-xs">
                  {thread.lastMessage || "No messages yet"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(thread.lastMessageAt), {
                    addSuffix: true,
                  })}
                </p>
                {thread.unreadCount > 0 && (
                  <span className="inline-block bg-blue-500 text-white text-xs rounded-full px-2 py-1 mt-1">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
