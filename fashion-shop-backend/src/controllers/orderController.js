import Order from "../models/Order.js";

// 1. Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  try {
    const { items, total, address, phone } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    // Kiểm tra dữ liệu đầu vào
    if (!address || !phone) {
      return res.status(400).json({
        message: "Vui lòng cung cấp địa chỉ và số điện thoại nhận hàng",
      });
    }

    const newOrder = new Order({
      user: req.user._id,
      items: items.map((item) => ({
        product: item.product._id || item.product,
        quantity: item.qty || item.quantity,
        price: item.product?.price || item.price,
      })),
      totalPrice: total, // Lưu ý: Database của bạn đặt tên là total hay totalPrice? (Code cũ bạn để totalPrice, code frontend gửi total)
      shippingAddress: {
        address,
        phone,
      },
      status: "Pending", // Sửa thành chữ Hoa "Pending" để khớp với logic Frontend
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Lấy danh sách đơn hàng của người dùng đang đăng nhập
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Lấy TẤT CẢ đơn hàng (Dành cho Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email") // Lấy thêm tên user
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Cập nhật trạng thái đơn hàng (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Hủy đơn hàng (User) - 👇 HÀM MỚI THÊM VÀO ĐÂY
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra quyền chủ sở hữu
    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Bạn không có quyền hủy đơn này" });
    }

    // Kiểm tra trạng thái: Chỉ cho hủy nếu đang Pending (hoặc lowercase pending)
    if (
      order.status !== "Pending" &&
      order.status !== "pending" &&
      order.status !== "Chờ xử lý"
    ) {
      return res
        .status(400)
        .json({ message: "Đơn hàng đang giao hoặc đã xong, không thể hủy!" });
    }

    // Cập nhật trạng thái
    order.status = "Cancelled";
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
