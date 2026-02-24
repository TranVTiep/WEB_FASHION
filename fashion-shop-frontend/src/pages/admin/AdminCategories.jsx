import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [name, setName] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Bạn không có quyền truy cập!");
      navigate("/");
    }
  }, [user, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.warning("Tên danh mục không được để trống");
    try {
      if (isEditing) {
        await api.put(`/categories/${currentCategory._id}`, { name });
        toast.success("Cập nhật thành công! 🌿");
      } else {
        await api.post("/categories", { name });
        toast.success("Thêm danh mục thành công! 🌿");
      }
      setName("");
      setIsEditing(false);
      setCurrentCategory(null);
      fetchCategories();
    } catch (err) {
      toast.error("Lỗi lưu danh mục");
    }
  };

  const handleEdit = (cat) => {
    setIsEditing(true);
    setCurrentCategory(cat);
    setName(cat.name);
  };
  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn chắc chắn muốn xóa? Lưu ý: Các sản phẩm thuộc danh mục này có thể bị lỗi hiển thị.",
      )
    ) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success("Đã xóa danh mục");
        fetchCategories();
      } catch (err) {
        toast.error("Lỗi xóa danh mục");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8 min-h-screen">
      {/* FORM BÊN TRÁI */}
      <div className="md:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-fit sticky top-24">
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          {isEditing ? "Sửa danh mục" : "Thêm danh mục"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">
              Tên danh mục
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"
              placeholder="Ví dụ: Áo thun, Quần jean..."
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className={`flex-1 text-white py-3 rounded-xl font-bold transition shadow-md ${isEditing ? "bg-yellow-500 hover:bg-yellow-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
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
                className="bg-gray-100 px-4 rounded-xl text-gray-600 hover:bg-gray-200 font-bold transition"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* DANH SÁCH BÊN PHẢI */}
      <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Quản lý Danh mục
          </h1>

          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="flex flex-col sm:flex-row justify-between items-center bg-gray-50/80 p-4 rounded-2xl border border-gray-100 hover:shadow-sm transition gap-4"
              >
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono mt-1">
                    ID: {cat._id}
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="flex-1 bg-white border border-blue-100 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="flex-1 bg-white border border-red-100 text-red-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-50 transition"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500">
                  Chưa có danh mục nào. Hãy thêm mới!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
