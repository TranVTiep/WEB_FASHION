import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    selectedItems,
    toggleSelectItem,
    selectAllItems,
  } = useCart();

  const navigate = useNavigate();

  // 👇 CHỈ TÍNH TIỀN NHỮNG MÓN ĐƯỢC CHỌN
  const total = cart.reduce((sum, item) => {
    const isSelected = selectedItems.includes(item.product._id);
    if (!isSelected) return sum; // Nếu không chọn thì bỏ qua, không cộng

    const price = item.product?.price || 0;
    const qty = item.qty || item.quantity || 1;
    return sum + price * qty;
  }, 0);

  // Xử lý khi bấm thanh toán
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.warning("Bạn chưa chọn sản phẩm nào để thanh toán! ⚠️");
      return;
    }
    // Chỉ mang những món ĐƯỢC CHỌN sang trang thanh toán
    // (Logic này cần sửa bên Checkout một chút, tạm thời cứ navigate đã)
    navigate("/checkout");
  };

  if (!cart || cart.length === 0)
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống trơn 😢</h2>
        <Link
          to="/products"
          className="bg-black text-white px-6 py-3 rounded font-bold"
        >
          ĐI MUA SẮM NGAY
        </Link>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* DANH SÁCH SẢN PHẨM */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-3 mb-2 pb-2 border-b">
          {/* CHECKBOX CHỌN TẤT CẢ */}
          <input
            type="checkbox"
            className="w-5 h-5 accent-black cursor-pointer"
            checked={cart.length > 0 && selectedItems.length === cart.length}
            onChange={(e) => selectAllItems(e.target.checked)}
          />
          <span className="font-semibold">Chọn tất cả ({cart.length})</span>
        </div>

        {cart.map((item, index) => {
          const product = item.product || {};
          const quantity = item.quantity || 1;
          const productId = product._id;
          const isSelected = selectedItems.includes(productId); // Kiểm tra xem món này có được chọn ko

          return (
            <div
              key={index}
              className={`flex gap-4 bg-white p-4 rounded-lg shadow-sm border items-center transition
                ${isSelected ? "border-black bg-gray-50" : "border-gray-200"}`}
            >
              {/* 👇 CHECKBOX TỪNG MÓN */}
              <input
                type="checkbox"
                className="w-5 h-5 accent-black cursor-pointer shrink-0"
                checked={isSelected}
                onChange={() => toggleSelectItem(productId)}
              />

              {/* Ảnh */}
              <Link to={`/products/${productId}`}>
                <img
                  src={product.image || "https://via.placeholder.com/100"}
                  className="w-24 h-24 object-cover rounded border"
                  alt=""
                />
              </Link>

              {/* Thông tin */}
              <div className="flex-1">
                <Link
                  to={`/products/${productId}`}
                  className="font-bold text-lg hover:text-blue-600 line-clamp-1"
                >
                  {product.name}
                </Link>
                <p className="text-gray-500 text-sm mb-2">
                  {product.category?.name || "Fashion"}
                </p>
                <p className="text-red-600 font-bold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(product.price)}
                </p>
              </div>

              {/* Bộ điều chỉnh số lượng */}
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                  <button
                    onClick={() => updateQuantity(productId, quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-10 text-center text-sm font-bold focus:outline-none"
                  />
                  <button
                    onClick={() => updateQuantity(productId, quantity + 1)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(productId)}
                  className="text-gray-400 hover:text-red-500 text-sm underline"
                >
                  Xóa
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* TỔNG TIỀN (Chỉ tính những món được chọn) */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow border sticky top-24">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            Tóm tắt đơn hàng
          </h2>

          <div className="flex justify-between mb-2 text-gray-600">
            <span>Đã chọn:</span>
            <span className="font-bold">{selectedItems.length} sản phẩm</span>
          </div>

          <div className="flex justify-between mb-2 text-gray-600">
            <span>Tạm tính:</span>
            <span>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(total)}
            </span>
          </div>

          <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-4 mb-6">
            <span>Tổng cộng:</span>
            <span className="text-red-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(total)}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            // Nếu chưa chọn món nào thì nút bị mờ đi
            disabled={selectedItems.length === 0}
            className={`w-full py-3 rounded-lg font-bold transition shadow-lg text-white
                ${selectedItems.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"}`}
          >
            MUA HÀNG ({selectedItems.length})
          </button>

          <Link
            to="/products"
            className="block text-center mt-4 text-sm text-gray-500 hover:underline"
          >
            ← Mua thêm món khác
          </Link>
        </div>
      </div>
    </div>
  );
}
