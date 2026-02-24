import { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users/forgot-password", { email });
      toast.success("Mật khẩu mới đã được gửi vào Email! 🌿");
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi gửi mail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="max-w-md w-full bg-white p-8 shadow-sm border border-gray-100 rounded-[2rem]">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Quên Mật Khẩu?
        </h2>
        <p className="text-gray-500 text-center mb-8 text-sm leading-relaxed">
          Đừng lo lắng! Hãy nhập email của bạn, chúng tôi sẽ gửi mật khẩu mới
          ngay lập tức.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm text-center"
            placeholder="nhap_email_cua_ban@example.com"
            required
          />
          <button
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition shadow-md shadow-emerald-200 disabled:opacity-50"
          >
            {loading ? "ĐANG GỬI..." : "LẤY LẠI MẬT KHẨU"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-sm font-bold text-gray-500 hover:text-emerald-600 hover:underline transition"
          >
            ← Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
