import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // 👇 1. STATE MỚI: Lưu danh sách ID các sản phẩm được chọn
  const [selectedItems, setSelectedItems] = useState([]);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data.items || []);
    } catch (err) {
      setCart([]);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (product, quantity = 1) => {
    try {
      await api.post("/cart", { productId: product._id, quantity });
      fetchCart();
      toast.success(`Đã thêm vào giỏ! 🛒`);
    } catch (err) {
      if (err.response?.status === 401) toast.info("Vui lòng đăng nhập! 🔒");
      else toast.error("Lỗi thêm giỏ hàng ❌");
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setCart((prev) =>
        prev.map((item) =>
          item.product._id === productId || item.product === productId
            ? { ...item, quantity: newQuantity }
            : item,
        ),
      );
      await api.put("/cart", { productId, quantity: newQuantity });
    } catch (err) {
      toast.error("Lỗi cập nhật số lượng");
      fetchCart();
    }
  };

  const removeFromCart = async (id) => {
    try {
      // Xóa khỏi giỏ thì xóa luôn khỏi danh sách đang chọn
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));

      setCart((prev) =>
        prev.filter((item) => (item.product._id || item._id) !== id),
      );
      await api.delete(`/cart/${id}`);
      fetchCart();
      toast.success("Đã xóa sản phẩm! 🗑️");
    } catch (err) {
      toast.error("Lỗi xóa sản phẩm");
    }
  };

  // 👇 2. HÀM MỚI: Tích chọn từng cái
  const toggleSelectItem = (productId) => {
    setSelectedItems((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId); // Bỏ chọn
      } else {
        return [...prev, productId]; // Chọn thêm
      }
    });
  };

  // 👇 3. HÀM MỚI: Chọn tất cả / Bỏ chọn tất cả
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
        selectedItems, // Xuất biến này ra
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleSelectItem, // Xuất hàm này ra
        selectAllItems, // Xuất hàm này ra
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
