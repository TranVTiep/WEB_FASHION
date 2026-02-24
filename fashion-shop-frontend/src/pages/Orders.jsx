import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast.success("Đã hủy đơn hàng thành công 🌿");
      fetchOrders();
    } catch (err) {
      toast.error("Không thể hủy đơn hàng này");
    }
  };

  const getStatusColor = (status) => {
    const s = String(status).toLowerCase();
    if (s.includes("pending") || s.includes("chờ"))
      return "text-yellow-600 bg-yellow-50 border border-yellow-200";
    if (s.includes("shipping"))
      return "text-blue-600 bg-blue-50 border border-blue-200";
    if (s.includes("delivered") || s.includes("complete"))
      return "text-emerald-600 bg-emerald-50 border border-emerald-200";
    if (s.includes("cancel") || s.includes("hủy"))
      return "text-red-500 bg-red-50 border border-red-200";
    return "text-gray-600 bg-gray-50 border border-gray-200";
  };

  const translateStatus = (status) => {
    const s = String(status).toLowerCase();
    if (s.includes("pending")) return "Chờ xử lý";
    if (s.includes("shipping")) return "Đang giao hàng";
    if (s.includes("delivered") || s.includes("complete")) return "Hoàn thành";
    if (s.includes("cancel")) return "Đã hủy";
    return status;
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-emerald-500 font-medium">
        Đang tải lịch sử... 🌿
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-[70vh]">
      <h1 className="text-3xl font-bold mb-10 text-center text-gray-800">
        Lịch Sử Đơn Hàng
      </h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-6">Bạn chưa có đơn hàng nào.</p>
          <Link
            to="/products"
            className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-emerald-600 transition"
          >
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div className="bg-gray-50/50 p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-500 font-medium">
                  <span className="text-gray-800 font-bold mr-4">
                    #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}
                >
                  {translateStatus(order.status)}
                </span>
              </div>
              <div className="p-6 space-y-4">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-3 border-b last:border-0 border-gray-50"
                  >
                    <div className="flex items-center gap-5">
                      <img
                        src={
                          item.product?.image ||
                          "https://via.placeholder.com/80"
                        }
                        className="w-20 h-20 object-cover rounded-2xl bg-gray-50"
                        alt=""
                      />
                      <div>
                        <p className="font-bold text-gray-800">
                          {item.product?.name || "Sản phẩm đã xóa"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 uppercase">
                          Size: {item.size} | Màu: {item.color}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                          x{item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-800">
                      {new Intl.NumberFormat("vi-VN").format(
                        item.price * item.quantity,
                      )}
                      đ
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-lg font-medium text-gray-600">
                  Tổng tiền:{" "}
                  <span className="font-bold text-emerald-600 text-xl ml-2">
                    {new Intl.NumberFormat("vi-VN").format(order.totalPrice)}đ
                  </span>
                </div>
                {String(order.status).toLowerCase().includes("pending") ? (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 px-6 py-2.5 rounded-xl text-sm font-bold transition"
                  >
                    Hủy đơn hàng
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-100 text-gray-400 px-6 py-2.5 rounded-xl text-sm font-bold cursor-not-allowed"
                  >
                    {String(order.status).toLowerCase().includes("cancel")
                      ? "Đã hủy"
                      : "Không thể hủy"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
