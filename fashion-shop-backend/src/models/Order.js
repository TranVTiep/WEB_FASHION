import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },

        // 👇 THÊM 2 DÒNG NÀY ĐỂ LƯU BIẾN THỂ
        size: { type: String },
        color: { type: String },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      phone: { type: String, required: true },
    },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    status: { type: String, required: true, default: "pending" }, // pending, delivered, cancelled
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
