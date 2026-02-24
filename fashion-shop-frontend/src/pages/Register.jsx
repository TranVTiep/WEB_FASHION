import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      toast.success("Đăng ký thành công! Chào mừng bạn. 🌿");
      navigate("/");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Đăng ký thất bại! ❌";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#F8FAFC] py-10">
      <div className="max-w-md w-full p-8 bg-white rounded-[2rem] shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Tạo tài khoản
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Bắt đầu hành trình mua sắm xanh cùng chúng tôi
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Họ và tên"
            className="w-full bg-gray-50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-gray-50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu (Tối thiểu 6 ký tự)"
            className="w-full bg-gray-50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
          <button className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition shadow-md shadow-emerald-200 mt-2">
            Đăng ký ngay
          </button>
        </form>

        <div className="mt-8 text-sm text-center">
          <p className="text-gray-500">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-emerald-600 font-bold hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Register;
