import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify"; // 👈 1. Nhớ import Toast

function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const totalItems = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  // 👇 2. Sửa hàm Logout: Thêm thông báo
  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công! Hẹn gặp lại 👋");
    navigate("/");
  };

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

        {/* ICON GIỎ HÀNG */}
        <Link
          to="/cart"
          className="relative hover:text-gray-300 transition flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>

          {totalItems > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full absolute -top-2 -right-2 animate-bounce">
              {totalItems}
            </span>
          )}
        </Link>

        {user ? (
          // --- ĐÃ ĐĂNG NHẬP ---
          <div className="relative group ml-4 z-50">
            <button className="flex items-center gap-1 hover:text-yellow-400 font-bold py-2">
              Hi, {user.name || user.username}
              <span className="text-xs">▼</span>
            </button>

            {/* MENU THẢ XUỐNG */}
            <div className="absolute right-0 top-full w-56 bg-white text-black shadow-lg rounded-md overflow-hidden hidden group-hover:block border border-gray-200">
              <div className="px-4 py-2 border-b bg-gray-50 text-xs text-gray-500">
                Tài khoản
              </div>

              {/* ADMIN LINKS */}
              {user.role === "admin" && (
                <div className="border-b border-gray-100">
                  <p className="px-4 py-1 text-[10px] text-gray-400 uppercase font-bold mt-1">
                    Quản trị viên
                  </p>

                  {/* Link Dashboard chuẩn */}
                  <Link
                    to="/admin/dashboard"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-purple-600 font-bold"
                  >
                    📊 Thống kê
                  </Link>

                  <Link
                    to="/admin/orders"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-blue-600"
                  >
                    📦 Quản lý Đơn
                  </Link>
                  <Link
                    to="/admin/products"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-blue-600"
                  >
                    👕 Quản lý SP
                  </Link>
                  <Link
                    to="/admin/categories"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-blue-600"
                  >
                    📂 Quản lý DM
                  </Link>
                </div>
              )}

              {/* USER LINKS */}
              <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">
                🕒 Lịch sử đơn hàng
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-bold border-t"
              >
                Đăng xuất
              </button>
            </div>
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
