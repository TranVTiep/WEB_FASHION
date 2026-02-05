import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext"; // 👈 1. Import AuthContext

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth(); // 👈 2. Lấy user từ AuthContext
  const [cart, setCart] = useState([]);

  // State lưu danh sách ID các sản phẩm được chọn
  const [selectedItems, setSelectedItems] = useState([]);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data.items || []);
    } catch (err) {
      console.error("Lỗi lấy giỏ hàng:", err);
      setCart([]);
    }
  };

  // 👇 3. SỬA ĐOẠN NÀY: Chỉ fetch khi có user
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      // Nếu chưa đăng nhập (hoặc vừa đăng xuất), xóa sạch giỏ hàng trên UI
      setCart([]);
      setSelectedItems([]);
    }
  }, [user]); // Chạy lại mỗi khi trạng thái đăng nhập thay đổi

  const addToCart = async (product, quantity = 1) => {
    // Chặn ngay từ client nếu chưa đăng nhập
    if (!user) {
      toast.info("Vui lòng đăng nhập để mua hàng! 🔒");
      return;
    }

    try {
      await api.post("/cart", { productId: product._id, quantity });
      fetchCart();
      toast.success(`Đã thêm vào giỏ! 🛒`);
    } catch (err) {
      if (err.response?.status === 401)
        toast.info("Phiên đăng nhập hết hạn! 🔒");
      else toast.error("Lỗi thêm giỏ hàng ❌");
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      // Cập nhật UI ngay lập tức (Optimistic update)
      setCart((prev) =>
        prev.map((item) =>
          item.product._id === productId || item.product === productId
            ? { ...item, quantity: newQuantity }
            : item,
        ),
      );
      // Gọi API cập nhật ngầm
      await api.put("/cart", { productId, quantity: newQuantity });
    } catch (err) {
      toast.error("Lỗi cập nhật số lượng");
      fetchCart(); // Nếu lỗi thì load lại dữ liệu gốc
    }
  };

  const removeFromCart = async (id) => {
    try {
      // Xóa khỏi danh sách đang chọn
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));

      // Xóa khỏi UI ngay lập tức
      setCart((prev) =>
        prev.filter((item) => (item.product._id || item._id) !== id),
      );

      await api.delete(`/cart/${id}`);
      // Không cần gọi fetchCart() lại cũng được nếu muốn nhanh,
      // nhưng gọi lại để đồng bộ giá tiền tổng server tính toán thì tốt hơn.
      fetchCart();
      toast.success("Đã xóa sản phẩm! 🗑️");
    } catch (err) {
      toast.error("Lỗi xóa sản phẩm");
      fetchCart(); // Revert lại nếu lỗi
    }
  };

  // Tích chọn từng cái
  const toggleSelectItem = (productId) => {
    setSelectedItems((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId); // Bỏ chọn
      } else {
        return [...prev, productId]; // Chọn thêm
      }
    });
  };

  // Chọn tất cả / Bỏ chọn tất cả
  const selectAllItems = (isChecked) => {
    if (isChecked) {
      const allIds = cart.map((item) => item.product._id);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const clearCart = () => {
    setCart([]);
    setSelectedItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        selectedItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleSelectItem,
        selectAllItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
