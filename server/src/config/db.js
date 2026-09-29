import mongoose from "mongoose";

let listenersAttached = false;

const attachListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB connection lost / disconnected.");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB runtime connection error:", err.message || err);
  });
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_DB_URI || "mongodb://127.0.0.1:27017/GO-chatApp";
  mongoose.set("strictQuery", false);

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    attachListeners();
    return conn;
  } catch (error) {
    console.warn(`Local MongoDB connection unavailable (${error.message})`);

    if (process.env.NODE_ENV !== "production") {
      try {
        console.log("Attempting in-memory MongoDB fallback (mongodb-memory-server)...");
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        const mongod = await MongoMemoryServer.create();
        const inMemoryUri = mongod.getUri();
        const conn = await mongoose.connect(inMemoryUri);
        console.log("Connected to In-Memory MongoDB successfully for development.");
        attachListeners();
        return conn;
      } catch (memErr) {
        console.warn("In-memory MongoDB fallback failed:", memErr?.message || memErr);
      }
    }

    console.warn("Continuing server startup without active database connection. DB queries will fail until MongoDB is started.");
    return null;
  }
};

export default connectDB;



