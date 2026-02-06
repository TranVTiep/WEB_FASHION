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
  const [loading, setLoading] = useState(true);

  // State lưu trữ dữ liệu
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  // State cho báo cáo doanh thu
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [yearlyRevenue, setYearlyRevenue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resOrders, resProducts] = await Promise.all([
          api.get("/orders"),
          api.get("/products"),
        ]);

        const orders = resOrders.data;
        const products = Array.isArray(resProducts.data)
          ? resProducts.data
          : resProducts.data.products || [];

        // 1. TÍNH TOÁN CƠ BẢN
        const totalOrders = orders.length;
        const totalProducts = products.length;

        // 👇 FIX 1: Đếm đơn chờ xử lý (Bắt dính mọi trường hợp chữ hoa/thường)
        const pendingOrders = orders.filter((o) => {
          const s = String(o.status).toLowerCase();
          return s === "pending" || s === "chờ xử lý";
        }).length;

        // 👇 FIX 2: Tính doanh thu (Chỉ tính đơn Hoàn thành/Đã giao)
        const completedOrders = orders.filter((o) => {
          const s = String(o.status).toLowerCase();
          return s === "completed" || s === "delivered" || s === "hoàn thành";
        });

        // Ép kiểu Number để cộng tiền không bị lỗi chuỗi
        const totalRevenue = completedOrders.reduce(
          (acc, order) => acc + Number(order.totalPrice || 0),
          0,
        );

        // 3. PHÂN TÍCH DOANH THU THEO THÁNG & NĂM
        const currentYear = new Date().getFullYear();
        const revenueByMonth = {};
        let currentYearRevenue = 0;

        completedOrders.forEach((order) => {
          const date = new Date(order.createdAt);
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          const key = `Tháng ${month}`;

          if (year === currentYear) {
            revenueByMonth[key] =
              (revenueByMonth[key] || 0) + Number(order.totalPrice || 0);
            currentYearRevenue += Number(order.totalPrice || 0);
          }
        });

        const chartData = Object.keys(revenueByMonth)
          .map((key) => ({
            name: key,
            revenue: revenueByMonth[key],
            monthIndex: parseInt(key.replace("Tháng ", "")),
          }))
          .sort((a, b) => a.monthIndex - b.monthIndex);

        setStats({ totalRevenue, totalOrders, totalProducts, pendingOrders });
        setRecentOrders(
          orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5),
        );
        setMonthlyRevenue(chartData);
        setYearlyRevenue(currentYearRevenue);
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        Đang tải dữ liệu Dashboard... ⏳
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Xin chào, {user?.name || "Admin"}! Đây là tình hình kinh doanh hôm
            nay.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-gray-400 uppercase">
            Ngày hôm nay
          </p>
          <p className="text-lg font-bold text-gray-800">
            {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      {/* 1. KHỐI THỐNG KÊ TỔNG QUAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Doanh thu tổng */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Tổng Doanh Thu
            </p>
            <h3 className="text-2xl font-black text-green-600 mt-2">
              {formatMoney(stats.totalRevenue)}
            </h3>
          </div>
          <div className="mt-4 text-xs text-gray-400 bg-green-50 px-2 py-1 rounded w-fit text-green-700 font-bold">
            💰 Đã thực thu (Completed)
          </div>
        </div>

        {/* Doanh thu Năm nay */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Doanh thu năm {new Date().getFullYear()}
            </p>
            <h3 className="text-2xl font-black text-blue-600 mt-2">
              {formatMoney(yearlyRevenue)}
            </h3>
          </div>
          <div className="mt-4 text-xs text-gray-400 bg-blue-50 px-2 py-1 rounded w-fit text-blue-700 font-bold">
            📈 Tăng trưởng
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Tổng Đơn Hàng
            </p>
            <h3 className="text-2xl font-black text-gray-800 mt-2">
              {stats.totalOrders}
            </h3>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded font-bold">
              {stats.pendingOrders} Chờ xử lý
            </span>
          </div>
        </div>

        {/* Sản phẩm */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Sản Phẩm
            </p>
            <h3 className="text-2xl font-black text-purple-600 mt-2">
              {stats.totalProducts}
            </h3>
          </div>
          <Link
            to="/admin/products"
            className="mt-4 text-xs text-purple-600 hover:underline"
          >
            Quản lý kho &rarr;
          </Link>
        </div>
      </div>

      {/* 2. BIỂU ĐỒ & MENU NHANH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* CỘT TRÁI: BIỂU ĐỒ DOANH THU */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            📊 Biểu đồ doanh thu năm {new Date().getFullYear()}
          </h3>
          <div className="h-80 w-full">
            {monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />
                  <Tooltip
                    formatter={(value) => formatMoney(value)}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]}>
                    {monthlyRevenue.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? "#4F46E5" : "#6366F1"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic">
                Chưa có dữ liệu doanh thu năm nay
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: MENU NHANH */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold text-gray-800 mb-4">Thao tác nhanh</h3>
          <div className="flex flex-col gap-3">
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition group"
            >
              <span className="bg-white p-2 rounded shadow-sm text-lg group-hover:scale-110 transition">
                📦
              </span>
              <div className="flex-1">
                <p className="font-bold text-sm">Quản lý Đơn hàng</p>
                <p className="text-xs text-gray-500">
                  {stats.pendingOrders} đơn mới cần duyệt
                </p>
              </div>
            </Link>

            <Link
              to="/admin/products"
              className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 hover:bg-purple-50 hover:text-purple-700 transition group"
            >
              <span className="bg-white p-2 rounded shadow-sm text-lg group-hover:scale-110 transition">
                👕
              </span>
              <div className="flex-1">
                <p className="font-bold text-sm">Quản lý Sản phẩm</p>
                <p className="text-xs text-gray-500">Nhập kho, sửa giá</p>
              </div>
            </Link>

            <Link
              to="/admin/categories"
              className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 hover:bg-orange-50 hover:text-orange-700 transition group"
            >
              <span className="bg-white p-2 rounded shadow-sm text-lg group-hover:scale-110 transition">
                📂
              </span>
              <div className="flex-1">
                <p className="font-bold text-sm">Quản lý Danh mục</p>
                <p className="text-xs text-gray-500">Thêm/Sửa danh mục</p>
              </div>
            </Link>

            <Link
              to="/"
              className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition group mt-2 border-t"
            >
              <span className="bg-white p-2 rounded shadow-sm text-lg group-hover:scale-110 transition">
                🏠
              </span>
              <span className="font-bold text-sm">Về trang chủ Website</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. DANH SÁCH ĐƠN HÀNG MỚI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Đơn hàng mới nhất</h3>
          <Link
            to="/admin/orders"
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
              <tr>
                <th className="px-6 py-3">Mã đơn</th>
                <th className="px-6 py-3">Khách hàng</th>
                <th className="px-6 py-3">Ngày đặt</th>
                <th className="px-6 py-3">Tổng tiền</th>
                <th className="px-6 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-gray-800">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    {order.user?.name || "Khách vãng lai"}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {formatMoney(order.totalPrice)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase
                      ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {order.status === "Pending"
                        ? "Chờ xử lý"
                        : order.status === "Completed"
                          ? "Hoàn thành"
                          : order.status === "Cancelled"
                            ? "Đã hủy"
                            : order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              Chưa có đơn hàng nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
