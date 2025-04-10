// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth";

// Implement Singleton pattern for auth session
class AuthSessionManager {
  static instance;

  constructor() {
    // Initialize session management logic
  }

  static getInstance() {
    if (!AuthSessionManager.instance) {
      AuthSessionManager.instance = new AuthSessionManager();
    }
    return AuthSessionManager.instance;
  }

  // Additional session management methods
}

// Create the session manager
const sessionManager = AuthSessionManager.getInstance();

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
