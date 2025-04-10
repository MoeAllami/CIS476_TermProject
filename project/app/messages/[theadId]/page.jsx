// app/messages/[threadId]/page.jsx
import { getSession } from "@/lib/auth/sessionManager";
import { redirect } from "next/navigation";
import MessageThread from "@/app/components/messaging/MessageThread";
import Link from "next/link";

export default async function ThreadPage({ params }) {
  const session = await getSession();

  if (!session) {
    redirect(`/auth/signin?callbackUrl=/messages/${params.threadId}`);
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <Link href="/messages" className="text-blue-500 hover:underline">
          ← Back to all messages
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow h-[calc(100vh-200px)]">
        <MessageThread threadId={params.threadId} />
      </div>
    </div>
  );
}
