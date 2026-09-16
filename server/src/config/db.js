import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Mongo DB COnnected Successfully");
  } catch (error) {}
};

export default connectDB();
