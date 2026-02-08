import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const { items, total, address, phone } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ message: "Giỏ hàng trống" });
    if (!address || !phone)
      return res.status(400).json({ message: "Thiếu thông tin giao hàng" });

    // BƯỚC 1: KIỂM TRA stock
    for (const item of items) {
      const product = await Product.findById(item.product._id || item.product);
      if (!product)
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });

      // 👇 Chỉ kiểm tra stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Sản phẩm "${product.name}" không đủ hàng (Còn: ${product.stock})`,
        });
      }
    }

    // BƯỚC 2: TRỪ stock
    for (const item of items) {
      const product = await Product.findById(item.product._id || item.product);
      // 👇 Chỉ trừ stock
      product.stock = product.stock - item.quantity;
      await product.save();
    }

    // BƯỚC 3: LƯU ĐƠN
    const order = await Order.create({
      user: req.user._id,
      items: items.map((i) => ({
        product: i.product._id || i.product,
        quantity: i.quantity,
        price: i.price,
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

// ... (Các hàm getMyOrders, getAllOrders... giữ nguyên) ...
export const getMyOrders = async (req, res) => {
  /* Code cũ */
};
export const getAllOrders = async (req, res) => {
  /* Code cũ, nhớ bỏ password ở populate nếu cần */
  const orders = await Order.find({})
    .populate("user", "name email")
    .populate("items.product")
    .sort({ createdAt: -1 });
  res.json(orders);
};
export const updateOrderStatus = async (req, res) => {
  /* Code cũ */
};

// HỦY ĐƠN HÀNG (Hoàn lại stock)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy" });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Không có quyền" });
    if (order.status !== "pending")
      return res.status(400).json({ message: "Không thể hủy" });

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        // 👇 Cộng lại stock
        product.stock = product.stock + item.quantity;
        await product.save();
      }
    }
    order.status = "cancelled";
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
