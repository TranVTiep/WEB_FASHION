import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // State phân trang
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: "",
    stock: 0,
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Kiểm tra quyền
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Bạn không có quyền truy cập!");
      navigate("/");
    }
  }, [user, navigate]);

  // 2. Tải danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  // 3. Hàm tải sản phẩm
  const fetchProducts = async (pageNumber) => {
    try {
      const res = await api.get(`/products?pageNumber=${pageNumber}`);

      // Xử lý dữ liệu phân trang
      if (res.data.products) {
        setProducts(res.data.products);
        setPages(res.data.pages);
        setPage(res.data.page);
      } else {
        setProducts(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
      toast.error("Không tải được danh sách sản phẩm");
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 4. XỬ LÝ NHẬP EXCEL (MỚI) ---
  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const importFormData = new FormData();
    importFormData.append("file", file);

    try {
      // Thông báo đang xử lý
      toast.info("Đang đọc file Excel, vui lòng chờ... ⏳");

      await api.post("/upload/import", importFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Thông báo thành công
      toast.success("Nhập sản phẩm từ Excel thành công! 🎉");

      // Reset file input
      e.target.value = null;

      // Load lại trang 1 để thấy sản phẩm mới
      setPage(1);
      fetchProducts(1);
    } catch (err) {
      console.error(err);
      // Thông báo lỗi chi tiết từ Backend trả về
      const errorMsg = err.response?.data?.message || "Lỗi nhập file Excel!";
      toast.error(errorMsg + " ❌");
      e.target.value = null;
    }
  };

  // Xử lý Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      toast.warning("Vui lòng chọn danh mục!");
      return;
    }

    const submitData = {
      ...formData,
      price: parseInt(formData.price) || 0,
      stock: parseInt(formData.stock) || 0,
    };

    try {
      if (isEditing) {
        await api.put(`/products/${currentProduct._id}`, submitData);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("/products", submitData);
        toast.success("Thêm mới thành công!");
        setPage(1);
      }

      resetForm();
      setIsEditing(false);
      setCurrentProduct(null);
      fetchProducts(page);
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      image: "",
      category: "",
      stock: 0,
    });
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    const realStock =
      product.stock !== undefined ? product.stock : product.countInStock || 0;
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      category: product.category?._id || product.category || "",
      stock: realStock,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa?")) {
      try {
        await api.delete(`/products/${id}`);
        toast.success("Đã xóa sản phẩm");
        if (products.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchProducts(page);
        }
      } catch (err) {
        toast.error("Lỗi xóa sản phẩm");
      }
    }
  };

  const handleQuickStock = async (product, amount) => {
    const currentStock = parseInt(
      product.stock !== undefined ? product.stock : product.countInStock || 0,
    );
    const newStock = currentStock + amount;

    if (newStock < 0) return;

    try {
      await api.put(`/products/${product._id}`, {
        ...product,
        stock: newStock,
        countInStock: newStock,
      });
      fetchProducts(page);
    } catch (error) {
      toast.error("Lỗi cập nhật kho!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* --- CỘT TRÁI: FORM --- */}
      <div className="md:col-span-1 space-y-4 sticky top-24 h-fit">
        {/* 🔥 NÚT IMPORT EXCEL (MỚI) */}
        <div className="bg-white p-4 rounded shadow border border-green-200">
          <h3 className="font-bold text-gray-700 mb-2 text-sm uppercase">
            Nhập hàng nhanh
          </h3>
          <input
            type="file"
            id="import-excel"
            hidden
            accept=".xlsx, .xls"
            onChange={handleImportExcel}
          />
          <label
            htmlFor="import-excel"
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold cursor-pointer transition shadow-sm"
          >
            📂 Nhập từ Excel
          </label>
          <p className="text-xs text-gray-400 text-center mt-2">
            Hỗ trợ file .xlsx, .xls
          </p>
        </div>

        {/* FORM NHẬP TAY */}
        <div className="bg-white p-6 rounded shadow border">
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
                className="w-full border p-2 rounded focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium">Giá (VNĐ)</label>
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border p-2 rounded focus:border-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Tồn kho</label>
                <input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full border p-2 rounded focus:border-blue-500 outline-none font-bold text-red-600"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">
                Link ảnh (URL)
              </label>
              <input
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:border-blue-500 outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:border-blue-500 outline-none"
                rows="3"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium">Danh mục</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border p-2 rounded bg-white outline-none"
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
                className={`flex-1 text-white py-2 rounded font-bold transition shadow-md ${
                  isEditing
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isEditing ? "Cập nhật" : "Thêm mới"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    resetForm();
                    setCurrentProduct(null);
                  }}
                  className="bg-gray-300 px-3 rounded text-gray-700 hover:bg-gray-400 transition"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* --- CỘT PHẢI: DANH SÁCH --- */}
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-6 border-l-4 border-blue-600 pl-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Danh sách sản phẩm
          </h1>
          <span className="text-sm font-semibold bg-gray-100 px-3 py-1 rounded">
            Trang {page} / {pages}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {products.map((p) => {
            const displayStock =
              p.stock !== undefined ? p.stock : p.countInStock || 0;
            return (
              <div
                key={p._id}
                className="flex items-center bg-white border p-4 rounded shadow-sm hover:shadow-md transition"
              >
                <img
                  src={p.image || "https://via.placeholder.com/80"}
                  className="w-20 h-20 object-cover rounded border mr-4 bg-gray-100"
                  alt=""
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/80")
                  }
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {p.category?.name || "Uncategorized"}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm mt-1 mb-2 line-clamp-2">
                    {p.description || "Chưa có mô tả"}
                  </p>

                  <div className="flex items-center gap-4 text-sm mt-2">
                    <span className="text-red-600 font-bold text-base">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(p.price)}
                    </span>

                    <div className="flex items-center border rounded overflow-hidden select-none">
                      <button
                        onClick={() => handleQuickStock(p, -1)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold border-r active:bg-gray-300"
                      >
                        -
                      </button>
                      <span
                        className={`px-3 py-1 font-bold min-w-[3rem] text-center ${displayStock > 0 ? "text-green-700" : "text-red-600"}`}
                      >
                        {displayStock}
                      </span>
                      <button
                        onClick={() => handleQuickStock(p, 1)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold border-l active:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(p)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 font-medium transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 font-medium transition"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}

          {products.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded border border-dashed">
              <p className="text-gray-500">Không tìm thấy sản phẩm.</p>
            </div>
          )}
        </div>

        {/* Nút phân trang */}
        {pages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-4 py-2 border rounded font-bold transition ${page === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-black hover:text-white"}`}
            >
              ← Trước
            </button>
            <span className="px-4 py-2 font-bold bg-gray-100 rounded text-gray-700 border">
              {page} / {pages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
              disabled={page === pages}
              className={`px-4 py-2 border rounded font-bold transition ${page === pages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-black hover:text-white"}`}
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
