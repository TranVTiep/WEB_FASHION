import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom"; // 👈 Thêm Link
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Đăng nhập thành công! 🎉");
      navigate("/");
    } catch (err) {
      // 👇 Lấy câu thông báo lỗi chuẩn từ Backend trả về
      const errorMessage = err.response?.data?.message || "Lỗi đăng nhập! ❌";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Đăng nhập</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-black text-white py-2 rounded font-bold hover:bg-gray-800 transition">
          Đăng nhập
        </button>
      </form>

      {/* 👇 Thêm điều hướng sang trang Đăng ký và Quên mật khẩu */}
      <div className="mt-4 text-sm text-center flex flex-col space-y-2">
        <p>
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline font-semibold"
          >
            Đăng ký ngay
          </Link>
        </p>
        <Link to="/forgot-password" className="text-gray-500 hover:underline">
          Quên mật khẩu?
        </Link>
      </div>
    </div>
  );
}

export default Login;
