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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const [checkoutItems] = useState(() => {
    return cart.filter((item) =>
      selectedItems.includes(
        `${item._id}_${item.selectedSize}_${item.selectedColor}`,
      ),
    );
  });

  const total = checkoutItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  useEffect(() => {
    if (user) {
      if (!name) setName(user.name || "");
      if (!email) setEmail(user.email || "");
      if (!phone) setPhone(user.phone || "");
      if (!address) setAddress(user.address || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (checkoutItems.length === 0) navigate("/cart");
  }, [checkoutItems, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address || !phone || !name)
      return toast.error("Vui lòng nhập đủ thông tin! 🌿");

    setLoading(true);
    try {
      const orderData = {
        // Format mới
        items: checkoutItems.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        })),
        total: total,
        address: address,
        phone: phone,

        // Format dự phòng
        orderItems: checkoutItems.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          size: item.selectedSize,
          color: item.selectedColor,
        })),
        shippingAddress: { fullName: name, address, phone },
        totalPrice: total,
        paymentMethod: "COD",
      };

      const res = await api.post("/orders", orderData);

      if (res.status === 201 || res.status === 200) {
        toast.success("Đặt hàng thành công! 🎉");
        clearCart();
        // 👇 ĐÃ SỬA: Chuyển hướng về trang chủ ("/") thay vì trang "/orders"
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi đặt hàng (Hãy kiểm tra Backend)",
      );
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-[75vh]">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Hoàn Tất Đơn Hàng
      </h1>
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <form onSubmit={handlePlaceOrder} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input
              type="text"
              placeholder="Họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
              required
            />
            <input
              type="text"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-50 p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
              required
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
            required
          />
          <textarea
            placeholder="Địa chỉ giao hàng chi tiết"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-gray-50 p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
            rows="3"
            required
          />

          <div className="bg-emerald-50 p-6 rounded-2xl mt-6 border border-emerald-100">
            <div className="flex justify-between items-center text-xl font-bold text-gray-800">
              <span>Tổng thanh toán (COD):</span>
              <span className="text-emerald-600">
                {new Intl.NumberFormat("vi-VN").format(total)}đ
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-4 mt-6 rounded-2xl font-bold hover:bg-emerald-600 transition shadow-md shadow-emerald-200 disabled:opacity-50 text-lg"
          >
            {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Checkout;
