import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom"; // 👈 Import thêm Link
import api from "../api/axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
export default function Checkout() {
  const { cart, clearCart, selectedItems } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  //
  useEffect(() => {
    if (user) {
      setAddress(user.address || "");
      setPhone(user.phone || "");
    }
  }, [user]);
  // 1. Lọc sản phẩm được chọn (Logic ép kiểu String chuẩn xác)
  const checkoutItems = cart.filter((item) => {
    if (!item.product || !item.product._id) return false;
    return selectedItems.some(
      (selectedId) => String(selectedId) === String(item.product._id),
    );
  });

  // 2. Kiểm tra nếu chưa chọn món nào
  useEffect(() => {
    if (selectedItems.length === 0 || checkoutItems.length === 0) {
      // toast.warning("Vui lòng chọn sản phẩm trước! ⚠️"); // Có thể bỏ dòng này nếu thấy phiền
      navigate("/cart");
    }
  }, [selectedItems, checkoutItems, navigate]);

  // 3. Tính tổng tiền
  const total = checkoutItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    const qty = item.qty || item.quantity || 1;
    return sum + price * qty;
  }, 0);

  const handleOrder = async (e) => {
    e.preventDefault();

    if (!address.trim() || !phone.trim()) {
      toast.warning("Vui lòng nhập đầy đủ Địa chỉ và SĐT! ⚠️");
      return;
    }

    setLoading(true);
    try {
      await api.post("/orders", {
        items: checkoutItems,
        total: total,
        address: address,
        phone: phone,
      });

      clearCart();
      toast.success("Đặt hàng thành công! Đơn hàng đang được xử lý 🚀");
      navigate("/");
    } catch (err) {
      console.error("Lỗi đặt hàng:", err);
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi đặt hàng ❌",
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* CỘT TRÁI: FORM NHẬP THÔNG TIN */}
      <div>
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-black pl-3">
          Thông tin giao hàng
        </h2>
        <form
          id="checkout-form"
          onSubmit={handleOrder}
          className="space-y-5 bg-white p-6 rounded shadow border"
        >
          <div>
            <label className="block text-sm font-bold mb-2">
              Số điện thoại (*)
            </label>
            <input
              type="tel"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-black outline-none transition"
              placeholder="Nhập số điện thoại..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Địa chỉ nhận hàng (*)
            </label>
            <textarea
              rows="3"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-black outline-none transition"
              placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            ></textarea>
          </div>

          <div className="bg-blue-50 p-4 rounded text-sm text-blue-800 border border-blue-200">
            <strong>Lưu ý:</strong> Đơn hàng sẽ được thanh toán khi nhận hàng
            (COD).
          </div>
        </form>
      </div>

      {/* CỘT PHẢI: XEM LẠI ĐƠN HÀNG */}
      <div>
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-600 pl-3">
          Đơn hàng ({checkoutItems.length} món)
        </h2>
        <div className="bg-gray-50 p-6 rounded shadow-inner border sticky top-24">
          {/* DANH SÁCH SẢN PHẨM */}
          <div className="max-h-96 overflow-y-auto pr-2">
            {checkoutItems.map((item, index) => {
              const product = item.product || {};
              const price = product.price || 0;
              const qty = item.qty || item.quantity || 1;

              return (
                <div
                  key={index}
                  className="flex justify-between items-center py-4 border-b last:border-0 border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image || "https://via.placeholder.com/50"}
                      className="w-16 h-16 object-cover rounded border bg-white"
                      alt=""
                    />
                    <div>
                      <p className="font-bold text-gray-800 line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">Số lượng: {qty}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(price * qty)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mt-6 pt-4 border-t border-gray-300">
            <span className="text-lg font-bold text-gray-700">Tổng cộng:</span>
            <span className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(total)}
            </span>
          </div>

          {/* NÚT XÁC NHẬN */}
          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className={`w-full mt-6 py-4 rounded-lg font-bold text-lg text-white transition transform active:scale-95
                    ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800 shadow-lg"}`}
          >
            {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
          </button>

          {/* 👇 NÚT QUAY LẠI GIỎ HÀNG (Mới thêm) */}
          <Link
            to="/cart"
            className="block text-center mt-4 text-sm text-gray-500 hover:text-black hover:underline transition"
          >
            ← Quay lại Giỏ hàng để chọn lại
          </Link>
        </div>
      </div>
    </div>
  );
}
