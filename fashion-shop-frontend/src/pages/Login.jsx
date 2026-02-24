import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
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
      toast.success("Đăng nhập thành công! 🌿");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi đăng nhập!");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#F8FAFC]">
      <div className="max-w-md w-full p-8 bg-white rounded-[2rem] shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Chào mừng trở lại
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Nhập Email"
            className="w-full bg-gray-50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full bg-gray-50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition shadow-md shadow-emerald-200">
            Đăng nhập
          </button>
        </form>
        <div className="mt-8 text-sm text-center flex flex-col space-y-3">
          <p className="text-gray-500">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-emerald-600 font-bold hover:underline"
            >
              Tạo tài khoản
            </Link>
          </p>
          <Link
            to="/forgot-password"
            className="text-gray-400 hover:text-emerald-500 font-medium"
          >
            Quên mật khẩu?
          </Link>
        </div>
      </div>
    </div>
  );
}
export default Login;
