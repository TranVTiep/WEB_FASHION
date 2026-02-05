import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [name, setName] = useState(""); // Form chỉ cần nhập tên

  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Bảo vệ trang Admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      alert("Bạn không có quyền truy cập!");
      navigate("/");
    }
  }, [user, navigate]);

  // 2. Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 3. Xử lý Thêm / Sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Tên danh mục không được để trống");

    try {
      if (isEditing) {
        // Sửa
        await api.put(`/categories/${currentCategory._id}`, { name });
        alert("Cập nhật thành công!");
      } else {
        // Thêm mới
        await api.post("/categories", { name });
        alert("Thêm danh mục thành công!");
      }

      // Reset form
      setName("");
      setIsEditing(false);
      setCurrentCategory(null);
      fetchCategories(); // Load lại bảng
    } catch (err) {
      console.error(err);
      alert("Lỗi lưu danh mục");
    }
  };

  // 4. Nút Sửa
  const handleEdit = (cat) => {
    setIsEditing(true);
    setCurrentCategory(cat);
    setName(cat.name);
  };

  // 5. Nút Xóa
  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn chắc chắn muốn xóa? Lưu ý: Các sản phẩm thuộc danh mục này có thể bị lỗi hiển thị.",
      )
    ) {
      try {
        await api.delete(`/categories/${id}`);
        alert("Đã xóa danh mục");
        fetchCategories();
      } catch (err) {
        alert("Lỗi xóa danh mục");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* FORM BÊN TRÁI */}
      <div className="md:col-span-1 bg-white p-6 rounded shadow border h-fit">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {isEditing ? "Sửa danh mục" : "Thêm danh mục"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên danh mục
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Ví dụ: Áo thun, Quần jean..."
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className={`flex-1 text-white py-2 rounded font-bold ${isEditing ? "bg-yellow-500 hover:bg-yellow-600" : "bg-purple-600 hover:bg-purple-700"}`}
            >
              {isEditing ? "Cập nhật" : "Thêm mới"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setName("");
                }}
                className="bg-gray-300 px-3 rounded text-gray-700 hover:bg-gray-400"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* DANH SÁCH BÊN PHẢI */}
      <div className="md:col-span-2">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-purple-600 pl-4">
          Quản lý Danh mục
        </h1>

        <div className="bg-white rounded shadow border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="p-4 border-b">Tên danh mục</th>
                <th className="p-4 border-b">ID (Dùng cho API)</th>
                <th className="p-4 border-b text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-800">{cat.name}</td>
                  <td className="p-4 text-xs font-mono text-gray-500">
                    {cat._id}
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-blue-600 hover:underline font-medium text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-red-500 hover:underline font-medium text-sm"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-gray-500">
                    Chưa có danh mục nào. Hãy thêm mới!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
