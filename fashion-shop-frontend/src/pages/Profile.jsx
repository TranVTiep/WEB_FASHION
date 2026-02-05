import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify";

// Hàm kiểm tra SĐT
const isValidPhone = (phone) => {
  return /^0\d{9}$/.test(phone);
};

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // 👇 1. KIỂM TRA QUYỀN ADMIN
  const isAdmin = user?.role === "admin";

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        username: user.username || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        currentPassword: "",
        password: "",
        confirmPassword: "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- VALIDATION ---
    if (!formData.username.trim()) {
      return toast.warning("Tên hiển thị không được để trống! ⚠️");
    }

    // 👇 2. CHỈ CHECK SĐT NẾU KHÔNG PHẢI LÀ ADMIN
    if (!isAdmin && formData.phone && !isValidPhone(formData.phone)) {
      return toast.warning("Số điện thoại không hợp lệ ! 📞");
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        return toast.warning("Mật khẩu mới phải có ít nhất 6 ký tự! 🔐");
      }
      if (!formData.currentPassword) {
        return toast.error("Vui lòng nhập mật khẩu cũ để xác thực! 🛑");
      }
      if (formData.password !== formData.confirmPassword) {
        return toast.error("Mật khẩu xác nhận không khớp! ❌");
      }
    }

    setLoading(true);
    try {
      const res = await api.put("/users/profile", {
        username: formData.username,
        email: formData.email,

        // 👇 3. ADMIN KHÔNG GỬI PHONE/ADDRESS (Giữ nguyên cái cũ hoặc rỗng)
        phone: isAdmin ? "" : formData.phone,
        address: isAdmin ? "" : formData.address,

        ...(formData.password && {
          password: formData.password,
          currentPassword: formData.currentPassword,
        }),
      });

      const updatedUser = res.data;
      setUser(updatedUser);
      toast.success("Cập nhật hồ sơ thành công! 🎉");

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        password: "",
        confirmPassword: "",
      }));
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Lỗi cập nhật hồ sơ";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10 mb-10">
      <h2 className="text-2xl font-bold mb-6 text-center uppercase border-b pb-4">
        {isAdmin ? "Hồ sơ Quản trị viên" : "Hồ sơ cá nhân"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tên hiển thị */}
        <div>
          <label className="block font-medium text-gray-700">
            Tên hiển thị
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full border p-2 rounded mt-1 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* 👇 4. ẨN HAI Ô NÀY NẾU LÀ ADMIN */}
        {!isAdmin && (
          <>
            {/* Số điện thoại */}
            <div>
              <label className="block font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại..."
                className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block font-medium text-gray-700">
                Địa chỉ giao hàng
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ nhận hàng..."
                rows="3"
                className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-black outline-none"
              ></textarea>
            </div>
          </>
        )}

        {/* Khu vực Đổi mật khẩu */}
        <div className="border-t pt-4 mt-4 bg-gray-50 p-4 rounded">
          <h3 className="font-bold text-gray-700 mb-2">
            Đổi mật khẩu (Không bắt buộc)
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu cũ
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu hiện tại..."
              className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-black outline-none bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Mật khẩu mới</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu mới..."
                className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-black outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-sm">Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu mới..."
                className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-black outline-none bg-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white font-bold py-3 rounded hover:bg-gray-800 transition mt-6"
        >
          {loading ? "Đang lưu..." : "CẬP NHẬT HỒ SƠ"}
        </button>
      </form>
    </div>
  );
}
