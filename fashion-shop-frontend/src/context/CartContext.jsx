import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  // State lưu danh sách ID các sản phẩm được chọn (để thanh toán sau này)
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

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
      setSelectedItems([]);
    }
  }, [user]);

  // 👇 1. SỬA HÀM ADD: THÊM CHECK TỒN KHO
  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      toast.info("Vui lòng đăng nhập để mua hàng! 🔒");
      return;
    }

    // --- LOGIC KIỂM TRA TỒN KHO MỚI ---
    // Tìm xem sản phẩm này đã có trong giỏ chưa
    const existingItem = cart.find((item) => item.product._id === product._id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    const newQty = currentQty + quantity;

    // Kiểm tra số lượng tồn kho (nếu có thông tin stock)
    // Lưu ý: product.stock lấy từ trang ProductDetail/Home truyền vào
    if (product.stock !== undefined && newQty > product.stock) {
      toast.warning(`Chỉ còn ${product.stock} sản phẩm trong kho! 😅`);
      return; // Dừng lại, không gọi API
    }
    // ----------------------------------

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

  // 👇 2. SỬA HÀM UPDATE: THÊM CHECK TỒN KHO
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    // --- LOGIC KIỂM TRA TỒN KHO MỚI ---
    const itemToUpdate = cart.find(
      (item) => item.product._id === productId || item.product === productId,
    );

    if (itemToUpdate) {
      const stock = itemToUpdate.product.stock || 0;
      // Nếu số lượng mới lớn hơn tồn kho -> Chặn luôn
      if (newQuantity > stock) {
        toast.warning(`Kho chỉ còn ${stock} cái thôi!`);
        return;
      }
    }
    // ----------------------------------

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
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));

      setCart((prev) =>
        prev.filter((item) => (item.product._id || item._id) !== id),
      );

      await api.delete(`/cart/${id}`);
      fetchCart();
      toast.success("Đã xóa sản phẩm! 🗑️");
    } catch (err) {
      toast.error("Lỗi xóa sản phẩm");
      fetchCart();
    }
  };

  const toggleSelectItem = (productId) => {
    setSelectedItems((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

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
