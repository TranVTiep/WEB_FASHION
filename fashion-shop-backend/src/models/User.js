import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "blocked"], default: "active" },

    // 👇 THÊM 2 DÒNG NÀY VÀO ĐÂY 👇
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    // 👆 ---------------------- 👆
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
