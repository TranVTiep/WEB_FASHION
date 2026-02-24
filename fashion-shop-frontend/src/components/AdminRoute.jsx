import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useEffect } from "react";

const AdminRoute = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      toast.error("Bạn không có quyền vào khu vực Admin! 🛡️");
    }
  }, [user, loading]);

  if (loading) return null; // Hoặc loading spinner

  return user && user.role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
};

export default AdminRoute;
