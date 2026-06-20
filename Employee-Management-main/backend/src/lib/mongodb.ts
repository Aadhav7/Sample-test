import mongoose from "mongoose";
import { logger } from "./logger";

let isConnected = false;
let connectionError: Error | null = null;

export function getConnectionError(): Error | null {
  return connectionError;
}

export async function connectMongo(): Promise<void> {
  if (isConnected) return;

  const raw = process.env.MONGODB_URI ?? "";
  let uri = raw.trim().replace(/^["']|["']$/g, "");
  if (!uri) {
    throw new Error("MONGODB_URI must be set.");
  }
  // Auto-prepend scheme if user stored only the host/credentials part
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    uri = `mongodb+srv://${uri}`;
  }

  await mongoose.connect(uri, {
    dbName: "teceze-ems",
    serverSelectionTimeoutMS: 10000,
    tls: true,
  });
  isConnected = true;
  connectionError = null;
  logger.info("MongoDB connected");
}

export async function connectMongoWithRetry(): Promise<void> {
  const maxAttempts = 3;
  let lastErr: Error = new Error("unknown");
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      await connectMongo();
      return;
    } catch (err) {
      lastErr = err as Error;
      connectionError = lastErr;
      logger.warn({ err, attempt: i }, "MongoDB connection attempt failed");
      if (i < maxAttempts) await new Promise((r) => setTimeout(r, 3000 * i));
    }
  }
  logger.error({ err: lastErr }, "All MongoDB connection attempts failed — routes will return 503");
}
