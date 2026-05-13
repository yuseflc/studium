import mongoose from "mongoose";
import { MongoClient } from "mongodb"; // Importamos el cliente nativo
import { User, Course, Task, Submission, Session } from "@/models"; // Tus modelos
import { LOGGER } from "@/config/logger";

const MONGODB_URI: string | undefined = process.env.MONGODB_URI_PROD;

if (!MONGODB_URI) {
  throw new Error("La URI de MongoDB no está configurada en .env.local");
}

// --- LÓGICA PARA MONGOOSE (Tu connectDB actual) ---
declare global {
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
  var _mongoClientPromise: Promise<MongoClient> | undefined; // Para el cliente nativo
}

let cached = global.mongooseConnection || { conn: null, promise: null };
if (!global.mongooseConnection) global.mongooseConnection = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = { bufferCommands: false, maxPoolSize: 10 };
    cached.promise = mongoose.connect(String(MONGODB_URI), opts).then((m) => {
      LOGGER.debug('Mongoose conectado');
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// --- LÓGICA PARA NEXTAUTH (El "Client" que nos faltaba) ---
// Esto es lo que NextAuth necesita para el adapter
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

// Exportamos clientPromise para usarlo en el adapter de NextAuth
export { clientPromise };
export { User, Course, Task, Submission, Session };