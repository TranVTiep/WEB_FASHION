import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi song song cả 2 API để tiết kiệm thời gian
        const [resOrders, resProducts] = await Promise.all([
          api.get("/orders"),
          api.get("/products"),
        ]);

        const orders = resOrders.data;
        const products = resProducts.data; // Có thể API trả về { products: [...] } hoặc [...] tùy backend của bạn

        // 1. Tính toán số liệu
        const totalOrders = orders.length;
        const totalProducts = Array.isArray(products)
          ? products.length
          : products.products.length;

        // Tính doanh thu (chỉ tính đơn Đã giao hoặc Đã thanh toán nếu muốn chặt chẽ)
        // Ở đây mình tính tổng hết để bạn thấy số cho vui
        const totalRevenue = orders.reduce(
          (acc, order) => acc + (order.totalPrice || 0),
          0,
        );

        const pendingOrders = orders.filter(
          (o) => o.status === "Pending",
        ).length;

        setStats({ totalRevenue, totalOrders, totalProducts, pendingOrders });

        // 2. Lấy 5 đơn hàng mới nhất
        const sortedOrders = orders.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setRecentOrders(sortedOrders.slice(0, 5));
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return <div className="p-10 text-center">Đang tổng hợp số liệu... 📊</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Xin chào, {user?.name || "Admin"} 👋
      </h1>

      {/* --- CÁC THẺ THỐNG KÊ (STATS CARDS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Thẻ 1: Doanh thu */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <p className="text-gray-500 text-sm font-bold uppercase">
            Tổng Doanh Thu
          </p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(stats.totalRevenue)}
          </p>
        </div>

        {/* Thẻ 2: Tổng đơn */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-bold uppercase">
            Tổng Đơn Hàng
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {stats.totalOrders} đơn
          </p>
        </div>

        {/* Thẻ 3: Đơn chờ xử lý */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm font-bold uppercase">
            Đang Chờ Xử Lý
          </p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {stats.pendingOrders} đơn
          </p>
        </div>

        {/* Thẻ 4: Sản phẩm */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm font-bold uppercase">
            Tổng Sản Phẩm
          </p>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {stats.totalProducts} sp
          </p>
        </div>
      </div>

      {/* --- KHU VỰC ĐƠN HÀNG MỚI & MENU NHANH --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Đơn hàng mới nhất */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Đơn hàng mới nhất</h3>
            <Link
              to="/admin/orders"
              className="text-sm text-blue-600 hover:underline"
            >
              Xem tất cả &rarr;
            </Link>
          </div>
          <table className="w-full text-left">
            <tbody className="divide-y">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-bold text-sm">
                      #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </td>
                  <td className="p-4 text-sm">
                    {order.user?.username || "Khách"}
                  </td>
                  <td className="p-4 font-bold text-sm">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.totalPrice)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold 
                      ${
                        order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cột phải: Menu nhanh (Quick Actions) */}
        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">
            Thao tác nhanh
          </h3>
          <div className="flex flex-col gap-3">
            <Link
              to="/admin/products"
              className="flex items-center gap-3 p-3 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
            >
              <span className="text-xl">👕</span>
              <span className="font-bold">Quản lý Sản phẩm</span>
            </Link>
            <Link
              to="/admin/categories"
              className="flex items-center gap-3 p-3 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
            >
              <span className="text-xl">📂</span>
              <span className="font-bold">Quản lý Danh mục</span>
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 p-3 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition"
            >
              <span className="text-xl">📦</span>
              <span className="font-bold">Quản lý Đơn hàng</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-3 p-3 rounded bg-gray-50 text-gray-700 hover:bg-gray-100 transition mt-4 border-t"
            >
              <span className="text-xl">🏠</span>
              <span>Về Trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
