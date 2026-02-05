import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// 1. LẤY GIỎ HÀNG
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );
  if (!cart) return res.json({ items: [] });
  res.json(cart);
};

// 2. THÊM VÀO GIỎ
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product)
    return res.status(404).json({ message: "Sản phẩm không tồn tại" });

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity }],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
  }

  await cart.save();
  res.json(cart);
};

// 3. XÓA SẢN PHẨM KHỎI GIỎ (Đã sửa lại cho gọn)
export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ URL (lưu ý: router đặt là /:id thì ở đây lấy id)

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng trống" });

    // Lọc bỏ sản phẩm có ID trùng với id gửi lên
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== id && item._id.toString() !== id,
    );

    await cart.save();

    // Trả về giỏ hàng mới nhất
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. CẬP NHẬT SỐ LƯỢNG (Hàm mới - Phải nằm RIÊNG BIỆT ở ngoài)
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Tìm giỏ hàng của user
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart)
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

    // Tìm vị trí sản phẩm trong giỏ
    const itemIndex = cart.items.findIndex(
      (p) => p.product.toString() === productId,
    );

    if (itemIndex > -1) {
      if (quantity > 0) {
        cart.items[itemIndex].quantity = quantity; // Cập nhật số lượng mới
      } else {
        // Nếu số lượng <= 0 thì xóa luôn
        cart.items.splice(itemIndex, 1);
      }
    } else {
      return res.status(404).json({ message: "Sản phẩm không có trong giỏ" });
    }

    await cart.save();

    // Trả về dữ liệu đầy đủ để Frontend hiển thị ngay
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
