import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// --- 1. TẠO ĐƠN HÀNG (Safe cho Local MongoDB) ---
export const createOrder = asyncHandler(async (req, res) => {
  // Lấy data từ bản cập nhật Checkout mới (đã gửi cả 2 cấu trúc)
  const items = req.body.items || req.body.orderItems;
  const total = req.body.total || req.body.totalPrice;
  const address = req.body.address || req.body.shippingAddress?.address;
  const phone = req.body.phone || req.body.shippingAddress?.phone;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("Giỏ hàng trống");
  }
  if (!address || !phone) {
    res.status(400);
    throw new Error("Thiếu thông tin giao hàng (địa chỉ/SĐT)");
  }

  const orderItems = [];

  // Trừ tồn kho thông thường (Không dùng Transaction để tránh lỗi MongoDB local)
  for (const item of items) {
    const productId = item.product._id || item.product;

    // Kiểm tra và trừ kho
    const product = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true },
    );

    if (!product) {
      res.status(400);
      throw new Error(`Sản phẩm không đủ số lượng trong kho!`);
    }

    orderItems.push({
      product: productId,
      quantity: item.quantity,
      price: item.price,
      size: item.selectedSize || item.size || "",
      color: item.selectedColor || item.color || "",
    });
  }

  // Tạo đơn hàng
  const order = new Order({
    user: req.user._id,
    items: orderItems,
    totalPrice: total,
    shippingAddress: { address, phone },
    status: "pending",
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product")
    .sort({ createdAt: -1 });
  res.json(orders);
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .populate("items.product", "name image price")
    .sort({ createdAt: -1 });
  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Không tìm thấy đơn hàng");
  }
  order.status = req.body.status || order.status;
  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// --- HỦY ĐƠN HÀNG ---
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Không tìm thấy đơn hàng");
  }
  if (order.status !== "pending") {
    res.status(400);
    throw new Error("Chỉ có thể hủy đơn hàng đang chờ xử lý");
  }

  // Hoàn lại kho
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.status = "cancelled";
  await order.save();

  res.json(order);
});
