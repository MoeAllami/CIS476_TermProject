// app/messages/page.jsx
import { getSession } from "@/lib/auth/sessionManager";
import { redirect } from "next/navigation";
import MessageThreadList from "../components/messaging/MessageThreadList";
import Navigation from "../components/Navigation";

export default async function MessagesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin?callbackUrl=/messages");
  }

  return (
    <div className="relative z-10 flex h-full">
      {/* Navigation Component */}
      <Navigation />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <div className="bg-white rounded-lg shadow">
          <MessageThreadList />
        </div>
      </div>
    </div>
  );
}
