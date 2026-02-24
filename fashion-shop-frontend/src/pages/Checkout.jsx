import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify";

const Checkout = () => {
  const { cart, selectedItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State cho form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // 👇 STATE MỚI: Đánh dấu là đã mua thành công chưa
  const [isSuccess, setIsSuccess] = useState(false);

  // Lọc sản phẩm được chọn
  const checkoutItems = cart.filter((item) => {
    const key = `${item._id}_${item.selectedSize}_${item.selectedColor}`;
    return selectedItems.includes(key);
  });

  const total = checkoutItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  // Tự động điền thông tin
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      const savedInfo = localStorage.getItem("shippingInfo");
      if (savedInfo) {
        const { savedPhone, savedAddress } = JSON.parse(savedInfo);
        if (savedPhone) setPhone(savedPhone);
        if (savedAddress) setAddress(savedAddress);
      }
    }
  }, [user]);

  // 👇 SỬA LOGIC: Nếu giỏ hàng trống VÀ chưa mua thành công thì mới đuổi về cart
  useEffect(() => {
    if (checkoutItems.length === 0 && !isSuccess) {
      navigate("/cart");
    }
  }, [checkoutItems, navigate, isSuccess]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!address || !phone || !name) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: checkoutItems.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        })),
        total: total,
        address,
        phone,
      };

      const res = await api.post("/orders", orderData);

      if (res.status === 201 || res.status === 200) {
        // 👇 1. Đánh dấu thành công ngay lập tức để chặn useEffect
        setIsSuccess(true);

        localStorage.setItem(
          "shippingInfo",
          JSON.stringify({
            savedPhone: phone,
            savedAddress: address,
          }),
        );

        toast.success("Đặt hàng thành công! Đang chuyển hướng... 🎉");

        setTimeout(() => {
          clearCart();
          navigate("/"); // Giờ thì nó sẽ chạy mượt mà về Home
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi đặt hàng");
      setLoading(false); // Chỉ tắt loading khi lỗi, thành công thì giữ loading cho đẹp
    }
  };

  // Nếu không có hàng và chưa mua xong thì không hiện gì (đợi redirect)
  if (checkoutItems.length === 0 && !isSuccess) return null;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 uppercase tracking-wide">
        Xác nhận thanh toán
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* --- CỘT TRÁI --- */}
        <div className="md:col-span-7">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2">
              📍 Địa chỉ nhận hàng
            </h2>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border p-3 rounded-lg focus:outline-black bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border p-3 rounded-lg focus:outline-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full border p-3 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Địa chỉ chi tiết
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border p-3 rounded-lg focus:outline-black"
                  rows="3"
                  required
                ></textarea>
              </div>
            </form>
          </div>
        </div>

        {/* --- CỘT PHẢI --- */}
        <div className="md:col-span-5">
          <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-4">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              📦 Đơn hàng của bạn
            </h2>

            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar">
              {checkoutItems.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start border-b border-dashed pb-4 last:border-0"
                >
                  <div className="w-16 h-16 flex-shrink-0 border rounded overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-gray-800 line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      {item.selectedSize && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                          Size: {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                          Màu: {item.selectedColor}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        x{item.quantity}
                      </span>
                      <span className="font-bold text-sm text-black">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(total)}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t mt-2">
                <span>Tổng thanh toán:</span>
                <span className="text-red-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(total)}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-lg font-bold mt-6 hover:bg-gray-800 transition disabled:bg-gray-400 shadow-lg"
            >
              {loading ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG NGAY"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
