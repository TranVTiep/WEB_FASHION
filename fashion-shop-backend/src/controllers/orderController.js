import Order from "../models/Order.js";
import Product from "../models/Product.js";

// --- 1. TẠO ĐƠN HÀNG ---
export const createOrder = async (req, res) => {
  try {
    const { items, total, address, phone } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Giỏ hàng trống" });
    if (!address || !phone)
      return res.status(400).json({ message: "Thiếu địa chỉ/SĐT" });

    // 1. Kiểm tra tồn kho (Chỉ check tổng stock)
    for (const item of items) {
      const product = await Product.findById(item.product._id || item.product);
      if (!product)
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `"${product.name}" không đủ hàng (Còn: ${product.stock})`,
        });
      }
    }

    // 2. Trừ kho
    for (const item of items) {
      const product = await Product.findById(item.product._id || item.product);
      product.stock = product.stock - item.quantity;
      await product.save();
    }

    // 3. Lưu đơn hàng (CÓ SIZE & COLOR)
    const order = await Order.create({
      user: req.user._id,
      items: items.map((i) => ({
        product: i.product._id || i.product,
        quantity: i.quantity, // FE gửi quantity
        price: i.price,

        // 👇 LƯU THÔNG TIN BIẾN THỂ
        size: i.selectedSize || "", // FE gửi selectedSize
        color: i.selectedColor || "", // FE gửi selectedColor
      })),
      totalPrice: total,
      shippingAddress: { address, phone },
      status: "pending",
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... (Các hàm getMyOrders, getAllOrders... GIỮ NGUYÊN)
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product")
    .sort({ createdAt: -1 });
  res.json(orders);
};
export const getAllOrders = async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .populate("items.product", "name image price")
    .sort({ createdAt: -1 });
  res.json(orders);
};
export const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Không tìm thấy" });
  order.status = req.body.status || order.status;
  const updated = await order.save();
  res.json(updated);
};
export const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  // ... Logic hủy đơn giữ nguyên như cũ
  if (!order) return res.status(404).json({ message: "Không tìm thấy" });
  if (order.status !== "pending")
    return res.status(400).json({ message: "Không thể hủy" });

  // Hoàn kho
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }
  order.status = "cancelled";
  await order.save();
  res.json(order);
};
