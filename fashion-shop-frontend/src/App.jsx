import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import { useAuth } from "./context/AuthContext";
import MyOrders from "./pages/MyOrders";

// --- COMPONENT BẢO VỆ ROUTE (ĐÃ CẬP NHẬT) ---
const ProtectedRoute = ({ children, isAdmin = false }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.info("Vui lòng đăng nhập để tiếp tục! 🔑");
      } else if (isAdmin && user.role !== "admin") {
        toast.error("Bạn không có quyền truy cập khu vực Admin! 🛡️");
      }
    }
  }, [user, isAdmin, loading]);

  if (loading) return null; // Tránh flash giao diện khi đang tải dữ liệu user

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto mt-4 flex-1 px-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Routes yêu cầu đăng nhập thường */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          {/* Routes Admin - Tất cả đều được bọc bởi ProtectedRoute với isAdmin={true} */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute isAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute isAdmin={true}>
                <AdminProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute isAdmin={true}>
                <AdminCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute isAdmin={true}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          {/* Cửa hậu: Nếu user nhập bậy bạ thì về trang chủ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
