import Order from "../models/Order.js";
import Product from "../models/Product.js";

// 1. Tạo đơn hàng mới (CÓ TRỪ KHO)
export const createOrder = async (req, res) => {
  try {
    const { items, total, address, phone } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    if (!address || !phone) {
      return res.status(400).json({
        message: "Vui lòng cung cấp địa chỉ và số điện thoại nhận hàng",
      });
    }

    // 👇 BƯỚC 1: KIỂM TRA TỒN KHO
    for (const item of items) {
      const productId = item.product._id || item.product;
      const quantity = item.qty || item.quantity;

      const productDB = await Product.findById(productId);
      if (!productDB) {
        return res.status(404).json({ message: `Sản phẩm không tồn tại` });
      }

      if (productDB.stock < quantity) {
        return res.status(400).json({
          message: `Sản phẩm "${productDB.name}" không đủ hàng (Chỉ còn ${productDB.stock})`,
        });
      }
    }

    // 👇 BƯỚC 2: TRỪ TỒN KHO
    for (const item of items) {
      const productId = item.product._id || item.product;
      const quantity = item.qty || item.quantity;

      const productDB = await Product.findById(productId);
      productDB.stock = productDB.stock - quantity;
      await productDB.save();
    }

    // 👇 BƯỚC 3: LƯU ĐƠN HÀNG
    const newOrder = new Order({
      user: req.user._id,
      items: items.map((item) => ({
        product: item.product._id || item.product,
        quantity: item.qty || item.quantity,
        price: item.product?.price || item.price,
      })),
      totalPrice: total,
      shippingAddress: { address, phone },
      status: "pending", // ✅ Đã chuẩn (chữ thường)
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Lấy đơn hàng của tôi
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Lấy tất cả đơn hàng (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Cập nhật trạng thái (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Hủy đơn hàng (User) - CÓ HOÀN LẠI KHO
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Bạn không có quyền hủy đơn này" });
    }

    // 👇 SỬA LỖI LOGIC QUAN TRỌNG TẠI ĐÂY:
    // Chỉ cho hủy khi status là "pending" (chữ thường)
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Đơn hàng đang giao hoặc đã xong, không thể hủy!" });
    }

    // 👇 LOGIC HOÀN KHO (Giữ nguyên vì đã tốt)
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = product.stock + item.quantity;
        await product.save();
      }
    }

    // 👇 SỬA LẠI TRẠNG THÁI CHO ĐÚNG ENUM (chữ thường)
    order.status = "cancelled";

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
