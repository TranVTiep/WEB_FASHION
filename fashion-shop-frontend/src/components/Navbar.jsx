import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation(); // Dùng để highlight link đang active

  const isAdmin = user?.role === "admin";

  const totalItems = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công! 👋");
    navigate("/");
  };

  // Component Link có hiệu ứng gạch chân (Helper Component)
  const NavLink = ({ to, children, active }) => (
    <Link
      to={to}
      className={`relative group py-2 text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
        active ? "text-white" : "text-gray-400 hover:text-white"
      }`}
    >
      {children}
      {/* Gạch chân animation */}
      <span
        className={`absolute bottom-0 left-0 h-[1px] bg-white transition-all duration-300 ${active ? "w-full" : "w-0 group-hover:w-full"}`}
      ></span>
    </Link>
  );

  return (
    <nav className="bg-black text-white sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex justify-between items-center">
        {/* 1. LOGO & MENU TRÁI */}
        <div className="flex items-center gap-12">
          {/* LOGO */}
          <Link
            to="/"
            className="text-2xl font-black tracking-tighter uppercase italic"
          >
            Fashion<span className="text-gray-500">.</span>
          </Link>

          {/* MENU CHÍNH (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            {/* --- NẾU LÀ ADMIN: Hiện menu quản lý --- */}
            {isAdmin ? (
              <>
                {/* 👇 YÊU CẦU CỦA BẠN: Link về trang chủ cho Admin */}
                <NavLink to="/" active={location.pathname === "/"}>
                  Xem Website
                </NavLink>
                <span className="text-gray-700">|</span>
                <NavLink
                  to="/admin/dashboard"
                  active={location.pathname.includes("/dashboard")}
                >
                  Thống kê
                </NavLink>
                <NavLink
                  to="/admin/products"
                  active={location.pathname.includes("/admin/products")}
                >
                  Sản phẩm
                </NavLink>
                <NavLink
                  to="/admin/orders"
                  active={location.pathname.includes("/admin/orders")}
                >
                  Đơn hàng
                </NavLink>
                <NavLink
                  to="/admin/categories"
                  active={location.pathname === "/admin/categories"}
                >
                  Danh mục
                </NavLink>
              </>
            ) : (
              // --- NẾU LÀ USER/KHÁCH: Hiện menu mua hàng ---
              <>
                <NavLink to="/" active={location.pathname === "/"}>
                  Trang chủ
                </NavLink>
                {/* Chỉ user đăng nhập mới thấy Shop (theo logic cũ của bạn) */}
                {user && (
                  <NavLink
                    to="/products"
                    active={location.pathname.includes("/products")}
                  >
                    Sản phẩm
                  </NavLink>
                )}
                {/* Các link tĩnh khác nếu có */}
                <NavLink to="/about" active={false}>
                  About
                </NavLink>
              </>
            )}
          </div>
        </div>

        {/* 2. MENU PHẢI (Search, Cart, Profile) */}
        <div className="flex items-center gap-6">
          {/* GIỎ HÀNG (Ẩn với Admin) */}
          {!isAdmin && user && (
            <Link to="/cart" className="relative group p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-300 group-hover:text-white transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-white text-black text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* USER DROPDOWN / LOGIN */}
          {user ? (
            <div className="relative group z-50">
              <button className="flex items-center gap-3 focus:outline-none py-2">
                <div className="text-right hidden lg:block">
                  <span className="block text-[10px] text-gray-400 uppercase tracking-wider">
                    {isAdmin ? "Administrator" : "Member"}
                  </span>
                  <span className="block text-sm font-bold leading-none">
                    {user.name}
                  </span>
                </div>
                {/* Avatar Circle */}
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${isAdmin ? "border-purple-500 text-purple-400" : "border-gray-600 text-gray-300"}`}
                >
                  <span className="font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </button>

              {/* DROPDOWN MENU */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white text-black rounded shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                <div className="py-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition"
                  >
                    <span>👤</span> Hồ sơ của tôi
                  </Link>

                  {!isAdmin && (
                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition"
                    >
                      <span>📦</span> Đơn mua
                    </Link>
                  )}

                  {/* Link Admin mobile (Nếu màn hình nhỏ menu trên bị ẩn thì hiện ở đây) */}
                  {isAdmin && (
                    <div className="md:hidden border-t my-1 pt-1">
                      <p className="px-4 py-1 text-[10px] uppercase text-gray-400 font-bold">
                        Quản lý
                      </p>
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Thống kê
                      </Link>
                      <Link
                        to="/admin/products"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Sản phẩm
                      </Link>
                    </div>
                  )}
                </div>

                <div className="border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 text-sm font-bold flex items-center gap-2 transition"
                  >
                    <span>🚪</span> Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // CHƯA ĐĂNG NHẬP
            <div className="flex items-center gap-6 border-l border-gray-700 pl-6 h-8">
              <Link
                to="/login"
                className="text-sm font-medium hover:text-gray-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-black text-xs font-bold uppercase tracking-wider px-5 py-2 hover:bg-gray-200 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
