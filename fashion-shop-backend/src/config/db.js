import mongoose from "mongoose";
import seedAdmin from "../seedAdmin.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // 👇 GỌI SEED ADMIN Ở ĐÂY
    await seedAdmin();
  } catch (error) {
    console.error("MongoDB error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
