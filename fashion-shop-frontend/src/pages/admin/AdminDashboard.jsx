import { useEffect, useState } from "react";
import api from "../../api/axios";
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard");
        setStats(res.data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "admin") fetchStats();
  }, [user]);

  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  const getStatusColor = (status) => {
    const s = String(status).toLowerCase();
    if (s === "pending")
      return "bg-yellow-50 text-yellow-600 border-yellow-200";
    if (s === "delivered" || s === "completed")
      return "bg-emerald-50 text-emerald-600 border-emerald-200";
    if (s === "cancelled") return "bg-red-50 text-red-500 border-red-200";
    return "bg-blue-50 text-blue-600 border-blue-200";
  };

  if (loading)
    return (
      <div className="p-20 text-center text-emerald-500 font-medium">
        Đang tải Dashboard... 🌿
      </div>
    );
  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Tổng Quan</h1>

      {/* KHOẢNG TRẮNG BO GÓC CHO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-emerald-500 text-white p-6 rounded-[2rem] shadow-md shadow-emerald-200">
          <h3 className="text-sm font-medium opacity-90 mb-2">
            DOANH THU THỰC
          </h3>
          <p className="text-3xl font-bold">
            {formatMoney(stats.summary.revenue)}
          </p>
        </div>
        <div className="bg-white border border-gray-100 text-gray-800 p-6 rounded-[2rem] shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">
            Tổng Đơn Hàng
          </h3>
          <p className="text-3xl font-bold">{stats.summary.orders}</p>
        </div>
        <div className="bg-white border border-gray-100 text-gray-800 p-6 rounded-[2rem] shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">
            Sản Phẩm
          </h3>
          <p className="text-3xl font-bold">{stats.summary.products}</p>
        </div>
        <div className="bg-white border border-gray-100 text-gray-800 p-6 rounded-[2rem] shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">
            Khách Hàng
          </h3>
          <p className="text-3xl font-bold">{stats.summary.users}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800">
            Biểu đồ doanh thu (7 ngày)
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="_id"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `${val / 1000}k`}
                  tick={{ fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => formatMoney(value)}
                  cursor={{ fill: "#F3F4F6" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 6, 6]}>
                  {stats.chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? "#10B981" : "#34D399"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Đơn mới nhất</h3>
          <div className="flex-1 space-y-4">
            {stats.latestOrders.map((order) => (
              <div
                key={order._id}
                className="border border-gray-50 bg-gray-50/50 p-4 rounded-2xl"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {order.user?.name || "Khách lẻ"}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      #{order._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {formatMoney(order.totalPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/admin/orders"
            className="block text-center text-emerald-600 font-bold bg-emerald-50 mt-6 py-3 rounded-xl hover:bg-emerald-100 transition"
          >
            Xem tất cả →
          </Link>
        </div>
      </div>
    </div>
  );
}
