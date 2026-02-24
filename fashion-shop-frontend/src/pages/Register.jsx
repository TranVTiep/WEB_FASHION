import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom"; // 👈 Thêm Link
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
      toast.success("Đăng ký thành công! Chào mừng bạn. 🎉");
      navigate("/"); // Đẩy thẳng vào trang chủ luôn
    } catch (err) {
      // 👇 Lấy lỗi chuẩn từ Backend (vd: "Email đã tồn tại")
      const errorMessage =
        err.response?.data?.message || "Đăng ký thất bại! ❌";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Đăng ký</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Họ tên"
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          minLength="6" // Khuyến khích mk ít nhất 6 ký tự
        />
        <button className="w-full bg-black text-white py-2 rounded font-bold hover:bg-gray-800 transition">
          Đăng ký
        </button>
      </form>

      {/* 👇 Thêm điều hướng về trang Đăng nhập */}
      <p className="mt-4 text-sm text-center">
        Đã có tài khoản?{" "}
        <Link
          to="/login"
          className="text-blue-600 hover:underline font-semibold"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

export default Register;
