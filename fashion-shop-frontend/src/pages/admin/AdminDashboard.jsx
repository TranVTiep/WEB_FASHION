import { useEffect, useState } from "react";
import api from "../../api/axios"; // Đảm bảo đường dẫn đúng
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null); // Lưu dữ liệu từ API
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 👇 GỌI API THỐNG KÊ (Thay vì gọi /orders và tự tính)
        const res = await api.get("/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchStats();
    }
  }, [user]);

  // Helper format tiền tệ
  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // Helper màu trạng thái
  const getStatusColor = (status) => {
    const s = String(status).toLowerCase();
    if (s === "pending")
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (s === "completed")
      return "bg-green-100 text-green-800 border-green-200";
    if (s === "cancelled") return "bg-red-100 text-red-800 border-red-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">
        Đang tải dữ liệu Dashboard... ⏳
      </div>
    );

  if (!stats) return <div className="p-10 text-center">Không có dữ liệu.</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 uppercase border-l-4 border-indigo-600 pl-4">
        Dashboard
      </h1>

      {/* 1. CARDS THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Doanh thu */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium opacity-90">💰 Doanh Thu Thực</h3>
          <p className="text-3xl font-bold mt-2">
            {formatMoney(stats.summary.revenue)}
          </p>
          <div className="mt-2 text-xs bg-white/20 w-fit px-2 py-1 rounded">
            Đã hoàn thành
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium opacity-90">📦 Tổng Đơn Hàng</h3>
          <p className="text-3xl font-bold mt-2">{stats.summary.orders}</p>
        </div>

        {/* Sản phẩm */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium opacity-90">👕 Sản Phẩm</h3>
          <p className="text-3xl font-bold mt-2">{stats.summary.products}</p>
        </div>

        {/* Khách hàng */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium opacity-90">👥 Khách Hàng</h3>
          <p className="text-3xl font-bold mt-2">{stats.summary.users}</p>
        </div>
      </div>

      {/* 2. BIỂU ĐỒ & ĐƠN MỚI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Biểu đồ */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-xl font-bold mb-6 text-gray-800">
            📈 Doanh thu 7 ngày qua
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip formatter={(value) => formatMoney(value)} />
                <Bar
                  dataKey="revenue"
                  fill="#4F46E5"
                  radius={[4, 4, 0, 0]}
                  name="Doanh thu"
                >
                  {stats.chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? "#4F46E5" : "#6366F1"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Đơn mới nhất */}
        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            🔔 Đơn mới nhất
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {stats.latestOrders.map((order) => (
              <div
                key={order._id}
                className="border-b pb-3 last:border-0 hover:bg-gray-50 p-2 rounded transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {order.user?.name || "Khách lẻ"}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      #{order._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  <span className="font-bold text-indigo-600 text-sm">
                    {formatMoney(order.totalPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/admin/orders"
            className="block text-center text-indigo-600 font-bold text-sm mt-4 hover:bg-indigo-50 py-2 rounded transition"
          >
            Xem tất cả đơn hàng →
          </Link>
        </div>
      </div>
    </div>
  );
}
