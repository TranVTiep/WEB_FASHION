import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    // 👇 Thêm phần này để lưu địa chỉ giao hàng
    shippingAddress: {
      address: { type: String, required: true },
      phone: { type: String, required: true },
    },
    status: {
      type: String,
      default: "pending", // pending, shipping, completed, cancelled
      enum: ["pending", "confirmed", "shipping", "completed", "cancelled"],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
