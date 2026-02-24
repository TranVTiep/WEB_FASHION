import mongoose from "mongoose";
import seedAdmin from "../seedAdmin.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // 👇 GỌI SEED ADMIN CÓ ĐIỀU KIỆN
    // Chỉ seed dữ liệu khi không phải môi trường production
    if (process.env.NODE_ENV !== "production") {
      await seedAdmin();
    }
  } catch (error) {
    console.error("MongoDB error:", error.message);
    process.exit(1); // Dừng tiến trình ngay lập tức nếu không kết nối được DB
  }
};

export default connectDB;
