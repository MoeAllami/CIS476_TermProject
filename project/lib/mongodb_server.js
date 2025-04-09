import { MongoClient } from "mongodb";

let client;
let clientPromise;

/**
 * Get a MongoDB client instance
 * @returns {Promise<{client: MongoClient, db: Object}>} - MongoDB client and database
 */
export async function getDbClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Please add MONGODB_URI to your environment variables");
  }

  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI);
    clientPromise = client.connect();
  }

  const connectedClient = await clientPromise;
  const db = connectedClient.db("driveshare");

  return { client: connectedClient, db };
}
