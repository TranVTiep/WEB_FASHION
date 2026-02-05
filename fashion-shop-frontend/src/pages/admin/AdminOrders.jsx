import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Bạn không có quyền truy cập trang Quản trị! ⛔");
      navigate("/");
    }
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        toast.error("Bạn không có quyền Admin!");
        navigate("/");
      }
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchOrders();
    }
  }, [user]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/orders/${id}`, { status: newStatus });
      toast.success(`Cập nhật đơn hàng thành ${newStatus}! ✅`);
      fetchOrders();
    } catch (err) {
      toast.error("Lỗi cập nhật trạng thái ❌");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-red-600 border-b pb-2">
        Quản lý Đơn hàng (Admin)
      </h1>

      <div className="overflow-x-auto shadow-md rounded-lg bg-white">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-white uppercase bg-gray-900">
            <tr>
              <th className="px-6 py-3">Mã đơn</th>
              <th className="px-6 py-3">Khách hàng & Giao tới</th>
              <th className="px-6 py-3">Tổng tiền</th>
              <th className="px-6 py-3">Ngày đặt</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3">Cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-blue-600 font-bold">
                  #{order._id.slice(-6).toUpperCase()}
                </td>

                {/* 👇 Cập nhật cột này để hiện Địa chỉ & SĐT */}
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800 text-base">
                    {order.user?.name || "Khách vãng lai"}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {order.user?.email}
                  </div>

                  <div className="bg-gray-100 p-2 rounded text-xs mt-2 border border-gray-200">
                    <p>
                      📞{" "}
                      <span className="font-bold">
                        {order.shippingAddress?.phone || "N/A"}
                      </span>
                    </p>
                    <p>🏠 {order.shippingAddress?.address || "Tại cửa hàng"}</p>
                  </div>
                </td>

                <td className="px-6 py-4 text-red-600 font-bold text-base">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(order.totalPrice)}
                </td>
                <td className="px-6 py-4">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold
                    ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : order.status === "shipping"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status?.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    className="border border-gray-300 p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                  >
                    <option value="pending">⏳ Chờ xử lý</option>
                    <option value="shipping">🚚 Đang giao</option>
                    <option value="completed">✅ Hoàn thành</option>
                    <option value="cancelled">❌ Đã hủy</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
