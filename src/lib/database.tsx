import mongoose from "mongoose";

declare global {
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI : string | undefined = process.env.MONGODB_URI_PROD;

if (!MONGODB_URI) {
  throw new Error("Por favor agrega tu URI de MongoDB a .env.local");
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
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose;
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

