import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
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
    if (user)
      setFormData((p) => ({
        ...p,
        username: user.username || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      }));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      formData.password &&
      (!formData.currentPassword ||
        formData.password !== formData.confirmPassword)
    )
      return toast.error("Kiểm tra lại mật khẩu!");

    setLoading(true);
    try {
      const res = await api.put("/users/profile", {
        name: formData.username,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        ...(formData.password && {
          password: formData.password,
          currentPassword: formData.currentPassword,
        }),
      });
      setUser(res.data);
      toast.success("Cập nhật thành công! 🎉");
      setFormData((p) => ({
        ...p,
        currentPassword: "",
        password: "",
        confirmPassword: "",
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center uppercase border-b pb-4">
        Hồ sơ cá nhân
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Tên hiển thị"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          className="w-full border p-2 rounded"
        />
        <input
          type="email"
          value={formData.email}
          disabled
          className="w-full border p-2 rounded bg-gray-100"
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <textarea
          placeholder="Địa chỉ"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          className="w-full border p-2 rounded"
          rows="3"
        />
        <div className="bg-gray-50 p-4 rounded space-y-2">
          <p className="font-bold text-sm">Đổi mật khẩu</p>
          <input
            type="password"
            placeholder="Mật khẩu cũ"
            value={formData.currentPassword}
            onChange={(e) =>
              setFormData({ ...formData, currentPassword: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white font-bold py-3 rounded hover:bg-gray-800"
        >
          {loading ? "Đang lưu..." : "CẬP NHẬT HỒ SƠ"}
        </button>
      </form>
    </div>
  );
}
