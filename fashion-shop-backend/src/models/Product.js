import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, default: 0 },
    description: { type: String },
    image: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // 👇 CHỈ DÙNG 1 BIẾN TỒN KHO
    stock: { type: Number, required: true, default: 0 },

    // 👇 THÊM 2 TRƯỜNG BIẾN THỂ
    sizes: [{ type: String }], // Ví dụ: ["S", "M", "L"]
    colors: [{ type: String }], // Ví dụ: ["Đỏ", "Xanh"]

    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
