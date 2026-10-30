import mongoose from "mongoose";

let listenersAttached = false;

export const normalizeMongoUri = (mongoUri) => {
  if (!mongoUri || typeof mongoUri !== "string") {
    return null;
  }

  const trimmed = mongoUri.trim();
  const withoutPrefix = trimmed.replace(/^MONGO_URI\s*=\s*/i, "");
  const cleaned = withoutPrefix.trim();

  if (!cleaned) {
    return null;
  }

  if (cleaned.includes("MONGO_URI=")) {
    return cleaned.split("MONGO_URI=")[0].trim() || null;
  }

  return cleaned;
};

const attachListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB Atlas connection lost / disconnected.");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB Atlas runtime connection error:", err.message || err);
  });
};

const connectDB = async () => {
  const mongoUri = normalizeMongoUri(process.env.MONGO_URI || process.env.MONGO_DB_URI);

  mongoose.set("strictQuery", false);

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!mongoUri) {
    console.warn(
      "MONGO_URI is missing or malformed. Falling back to local MongoDB or in-memory DB."
    );
  }

  const uriToUse = mongoUri && mongoUri.startsWith("mongodb") ? mongoUri : null;

  try {
    if (!uriToUse) {
      const fallbackUri = "mongodb://127.0.0.1:27017/GO-chatApp";
      console.warn(`Using local fallback DB: ${fallbackUri}`);
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
      attachListeners();
      return conn;
    }

    const conn = await mongoose.connect(uriToUse, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);

    attachListeners();

    return conn;
  } catch (error) {
    console.error(`MongoDB Atlas connection failed: ${error.message}`);

    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const conn = await mongoose.connect(mongod.getUri());
      console.log("Connected to in-memory MongoDB fallback successfully.");
      attachListeners();
      return conn;
    } catch (memError) {
      console.error("MongoDB fallback failed:", memError.message || memError);
      throw error;
    }
  }
};

export default connectDB;
