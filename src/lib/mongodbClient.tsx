import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI_PROD) {
  throw new Error('Variable MONGODB_URI_PROD no definida en .env.local');
}

const uri = process.env.MONGODB_URI_PROD;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // En desarrollo, usamos una variable global para no saturar las conexiones
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, creamos una conexión nueva
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;