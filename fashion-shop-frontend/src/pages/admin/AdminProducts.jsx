import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // 👈 Import toast

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: "",
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Bạn không có quyền truy cập! ⛔"); // 👈 Báo lỗi
      navigate("/");
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [resProducts, resCats] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);
      setProducts(
        Array.isArray(resProducts.data)
          ? resProducts.data
          : resProducts.data.products || [],
      );
      setCategories(resCats.data);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      toast.warning("Vui lòng chọn danh mục! ⚠️");
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/products/${currentProduct._id}`, formData);
        toast.success("Cập nhật sản phẩm thành công! ✅");
      } else {
        await api.post("/products", formData);
        toast.success("Thêm sản phẩm mới thành công! 🎉");
      }

      setFormData({
        name: "",
        price: "",
        description: "",
        image: "",
        category: "",
      });
      setIsEditing(false);
      setCurrentProduct(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lưu sản phẩm ❌");
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      category: product.category?._id || product.category || "",
    });
    // Cuộn lên đầu trang để sửa cho dễ
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa?")) {
      try {
        await api.delete(`/products/${id}`);
        toast.success("Đã xóa sản phẩm 🗑️");
        fetchData();
      } catch (err) {
        toast.error("Lỗi xóa sản phẩm ❌");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Cột trái Form */}
      <div className="md:col-span-1 bg-white p-6 rounded shadow border h-fit sticky top-24">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {isEditing ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Tên sản phẩm</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Giá (VNĐ)</label>
            <input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Link ảnh (URL)</label>
            <input
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              rows="3"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium">Danh mục</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className={`flex-1 text-white py-2 rounded font-bold ${isEditing ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-600 hover:bg-green-700"}`}
            >
              {isEditing ? "Cập nhật" : "Thêm mới"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: "",
                    price: "",
                    description: "",
                    image: "",
                    category: "",
                  });
                }}
                className="bg-gray-300 px-3 rounded text-gray-700"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Cột phải Danh sách */}
      <div className="md:col-span-2">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-blue-600 pl-4">
          Danh sách sản phẩm
        </h1>
        <div className="grid grid-cols-1 gap-4">
          {products.map((p) => (
            <div
              key={p._id}
              className="flex items-center bg-white border p-4 rounded shadow-sm hover:shadow-md transition"
            >
              <img
                src={p.image || "https://via.placeholder.com/80"}
                className="w-20 h-20 object-cover rounded border mr-4"
                alt=""
              />

              <div className="flex-1">
                <h3 className="font-bold text-lg">{p.name}</h3>
                <p className="text-red-600 font-bold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(p.price)}
                </p>
                <p className="text-xs text-blue-600 font-semibold bg-blue-50 inline-block px-2 py-1 rounded mt-1">
                  {p.category?.name || "Chưa phân loại"}
                </p>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-gray-500 text-center">Chưa có sản phẩm nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}
