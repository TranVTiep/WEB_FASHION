import { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  // 👇 STATE MỚI: Danh sách ID các sản phẩm được chọn để mua
  // Lưu dưới dạng: "productId_size_color" để phân biệt
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity, selectedSize, selectedColor) => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error("Vui lòng chọn Kích cỡ!");
      return false;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error("Vui lòng chọn Màu sắc!");
      return false;
    }

    const existItem = cart.find(
      (x) =>
        x._id === product._id &&
        x.selectedSize === selectedSize &&
        x.selectedColor === selectedColor,
    );

    if (existItem) {
      setCart(
        cart.map((x) =>
          x._id === product._id &&
          x.selectedSize === selectedSize &&
          x.selectedColor === selectedColor
            ? { ...existItem, quantity: existItem.quantity + quantity }
            : x,
        ),
      );
    } else {
      setCart([...cart, { ...product, quantity, selectedSize, selectedColor }]);
    }
    return true;
  };

  const removeFromCart = (productId, selectedSize, selectedColor) => {
    setCart(
      cart.filter(
        (x) =>
          !(
            x._id === productId &&
            x.selectedSize === selectedSize &&
            x.selectedColor === selectedColor
          ),
      ),
    );
    // Xóa luôn khỏi danh sách chọn nếu đang chọn
    const key = `${productId}_${selectedSize}_${selectedColor}`;
    setSelectedItems((prev) => prev.filter((k) => k !== key));
  };

  const updateQuantity = (productId, selectedSize, selectedColor, amount) => {
    setCart(
      cart.map((item) => {
        if (
          item._id === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
        ) {
          const newQty = item.quantity + amount;
          if (newQty < 1) return item;
          if (newQty > item.stock) {
            toast.error("Đã đạt giới hạn tồn kho!");
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedItems([]);
  };

  // 👇 HÀM XỬ LÝ CHECKBOX
  const toggleSelectItem = (productId, selectedSize, selectedColor) => {
    const key = `${productId}_${selectedSize}_${selectedColor}`;
    if (selectedItems.includes(key)) {
      setSelectedItems(selectedItems.filter((k) => k !== key)); // Bỏ chọn
    } else {
      setSelectedItems([...selectedItems, key]); // Chọn
    }
  };

  // Chọn tất cả / Bỏ chọn tất cả
  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]); // Bỏ hết
    } else {
      const allKeys = cart.map(
        (item) => `${item._id}_${item.selectedSize}_${item.selectedColor}`,
      );
      setSelectedItems(allKeys); // Chọn hết
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        selectedItems,
        toggleSelectItem,
        toggleSelectAll, // 👈 Xuất các hàm mới
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
