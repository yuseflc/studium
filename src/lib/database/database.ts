import mongoose from "mongoose";
import { LOGGER } from "@/config/logger";

declare global {
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI: string | undefined = process.env.MONGODB_URI_PROD;

if (!MONGODB_URI) {
  throw new Error("La URI de MongoDB no está configurada en .env.local");
}

let cached = global.mongooseConnection;

if (!cached) {
  cached = global.mongooseConnection = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    cached.promise = mongoose
      .connect(String(MONGODB_URI), opts)
      .then((mongoose) => {
        LOGGER.debug('MongoDB conectado exitosamente');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB error de conexión:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
