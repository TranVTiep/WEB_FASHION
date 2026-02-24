import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

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

  const NavLink = ({ to, children, active }) => (
    <Link
      to={to}
      className={`relative py-2 text-sm font-semibold transition-colors duration-300 ${
        active ? "text-emerald-500" : "text-gray-600 hover:text-emerald-500"
      }`}
    >
      {children}
      <span
        className={`absolute bottom-0 left-0 h-0.5 bg-emerald-500 transition-all duration-300 ${active ? "w-full" : "w-0"}`}
      ></span>
    </Link>
  );

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* LOGO */}
        <div className="flex items-center gap-12">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-emerald-600"
          >
            Eco<span className="text-gray-800">Fashion</span>
          </Link>

          {/* MENU */}
          <div className="hidden md:flex items-center gap-8">
            {isAdmin ? (
              <>
                <NavLink to="/" active={location.pathname === "/"}>
                  Website
                </NavLink>
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
              <>
                <NavLink to="/" active={location.pathname === "/"}>
                  Trang chủ
                </NavLink>
                <NavLink
                  to="/products"
                  active={location.pathname.includes("/products")}
                >
                  Sản phẩm
                </NavLink>
              </>
            )}
          </div>
        </div>

        {/* CỤM BÊN PHẢI */}
        <div className="flex items-center gap-6">
          {!isAdmin && user && (
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-emerald-500 transition"
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
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">{user.name}</p>
                <Link
                  to="/profile"
                  className="text-xs text-emerald-600 hover:underline"
                >
                  Hồ sơ cá nhân
                </Link>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-500 px-4 py-2 rounded-2xl text-sm font-bold hover:bg-red-100 transition"
              >
                Thoát
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-bold text-gray-600 hover:text-emerald-500"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-emerald-500 text-white text-sm font-bold px-5 py-2.5 rounded-2xl hover:bg-emerald-600 transition shadow-md shadow-emerald-200"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
