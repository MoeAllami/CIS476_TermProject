// lib/auth/sessionManager.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";

// Implement Singleton pattern for session management
class SessionManager {
  static instance;

  constructor() {
    // Initialize session management logic
  }

  static getInstance() {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async getSession(request) {
    return getServerSession(authOptions);
  }

  async getUserId(request) {
    const session = await this.getSession(request);
    return session?.user?.id || null;
  }
}

// Create and export the singleton instance
const sessionManagerInstance = SessionManager.getInstance();

export const getSession = (request) =>
  sessionManagerInstance.getSession(request);
export const getUserId = (request) => sessionManagerInstance.getUserId(request);
