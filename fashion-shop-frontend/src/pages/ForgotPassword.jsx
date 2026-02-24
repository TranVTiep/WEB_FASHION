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
      toast.success("Mật khẩu mới đã được gửi vào Email!");
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi gửi mail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          QUÊN MẬT KHẨU
        </h2>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Nhập email của bạn, chúng tôi sẽ gửi mật khẩu mới cho bạn.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 font-bold text-gray-700">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-black"
              placeholder="nhap_email_cua_ban@example.com"
              required
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:bg-gray-400"
          >
            {loading ? "Đang gửi..." : "LẤY LẠI MẬT KHẨU"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="text-sm font-bold text-gray-600 hover:text-black hover:underline"
          >
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
