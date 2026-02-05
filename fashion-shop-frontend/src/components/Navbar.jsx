import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext"; // 👈 1. Import Cart Context

function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart(); // 👈 2. Lấy dữ liệu giỏ hàng

  // 👈 3. Tính tổng số lượng sản phẩm đang có
  const totalItems = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  return (
    <nav className="bg-black text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
      {/* Logo */}
      <Link
        to="/"
        className="text-2xl font-bold tracking-wider hover:text-gray-300 transition"
      >
        FashionShop
      </Link>

      {/* Menu chính */}
      <div className="flex items-center space-x-6 text-sm font-medium">
        <Link to="/products" className="hover:text-gray-300 transition">
          SẢN PHẨM
        </Link>

        {/* 👇 4. ICON GIỎ HÀNG CÓ SỐ LƯỢNG */}
        <Link
          to="/cart"
          className="relative hover:text-gray-300 transition flex items-center gap-1"
        >
          <span>GIỎ HÀNG</span>
          {/* Chỉ hiện số nếu giỏ hàng có đồ */}
          {totalItems > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full absolute -top-2 -right-3 animate-bounce">
              {totalItems}
            </span>
          )}
        </Link>

        {user ? (
          // --- ĐÃ ĐĂNG NHẬP ---
          <div className="flex items-center gap-4 ml-4 border-l pl-4 border-gray-700">
            <span className="text-gray-300 hidden md:inline">
              Hi, {user.name}
            </span>

            {/* ADMIN MENU */}
            {user.role === "admin" && (
              <div className="flex gap-2">
                <Link
                  to="/admin/orders"
                  className="text-red-400 font-bold hover:text-red-300 text-xs border border-red-500 px-2 py-1 rounded"
                  title="Quản lý Đơn hàng"
                >
                  ĐƠN
                </Link>
                <Link
                  to="/admin/products"
                  className="text-blue-400 font-bold hover:text-blue-300 text-xs border border-blue-500 px-2 py-1 rounded"
                  title="Quản lý Sản phẩm"
                >
                  SP
                </Link>
                <Link
                  to="/admin/categories"
                  className="text-purple-400 font-bold hover:text-purple-300 text-xs border border-purple-500 px-2 py-1 rounded"
                  title="Quản lý Danh mục"
                >
                  DM
                </Link>
              </div>
            )}

            <Link
              to="/orders"
              className="text-yellow-400 hover:text-yellow-300 transition"
            >
              Lịch sử
            </Link>

            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
            >
              Logout
            </button>
          </div>
        ) : (
          // --- CHƯA ĐĂNG NHẬP ---
          <div className="flex items-center gap-4 ml-4 border-l pl-4 border-gray-700">
            <Link to="/login" className="hover:text-gray-300">
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="bg-white text-black px-3 py-1 rounded font-bold hover:bg-gray-200 transition"
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
