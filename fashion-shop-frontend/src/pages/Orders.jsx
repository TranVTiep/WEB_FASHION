import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/my-orders");
      setOrders(
        res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      );
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Hàm xử lý Hủy đơn phía User
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không? 🌿"))
      return;

    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast.success("Đã hủy đơn hàng thành công!");
      fetchOrders(); // Load lại danh sách để cập nhật UI và kho
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  if (loading)
    return <div className="text-center p-10">Đang tải lịch sử đơn hàng...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Đơn mua của tôi</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-mono text-gray-400">
                #{order._id.slice(-6).toUpperCase()}
              </span>
              {/* Badge trạng thái */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold 
                ${
                  order.status === "pending"
                    ? "bg-yellow-50 text-yellow-600"
                    : order.status === "cancelled"
                      ? "bg-red-50 text-red-500"
                      : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {order.status.toUpperCase()}
              </span>
            </div>

            {/* Danh sách sản phẩm trong đơn */}
            <div className="border-t border-b border-gray-50 py-4 mb-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm py-1">
                  <span>
                    {item.product?.name} (x{item.quantity})
                  </span>
                  <span className="font-bold">
                    {new Intl.NumberFormat("vi-VN").format(item.price)}đ
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <p className="font-bold text-lg">
                Tổng: {new Intl.NumberFormat("vi-VN").format(order.totalPrice)}đ
              </p>

              {/* CHỈ HIỆN NÚT HỦY KHI ĐANG PENDING */}
              {order.status === "pending" && (
                <button
                  onClick={() => handleCancelOrder(order._id)}
                  className="bg-red-50 text-red-500 px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition"
                >
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
