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

  // 4. XỬ LÝ NHẬP EXCEL
  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const importFormData = new FormData();
    importFormData.append("file", file);

    try {
      toast.info("Đang đọc file Excel, vui lòng chờ... ⏳");

      await api.post("/upload/import", importFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Nhập sản phẩm từ Excel thành công! 🌿");
      e.target.value = null;
      setPage(1);
      fetchProducts(1);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Lỗi nhập file Excel!";
      toast.error(errorMsg + " ❌");
      e.target.value = null;
    }
  };

  // 5. Xử lý Submit Form
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
        toast.success("Cập nhật thành công! 🌿");
      } else {
        await api.post("/products", submitData);
        toast.success("Thêm mới thành công! 🌿");
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
        toast.success("Đã xóa sản phẩm 🌿");
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
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-screen">
      {/* FORM BÊN TRÁI */}
      <div className="lg:col-span-1 space-y-6">
        {/* NÚT IMPORT EXCEL */}
        <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 shadow-sm">
          <h3 className="font-bold text-emerald-800 mb-3 text-sm uppercase">
            Nhập hàng hàng loạt
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
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-bold cursor-pointer transition shadow-md shadow-emerald-200"
          >
            📂 Tải file Excel lên
          </label>
        </div>

        {/* FORM NHẬP TAY */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            {isEditing ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              placeholder="Tên sản phẩm"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                name="price"
                type="number"
                placeholder="Giá (VNĐ)"
                value={formData.price}
                onChange={handleChange}
                className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
                required
              />
              <input
                name="stock"
                type="number"
                placeholder="Tồn kho"
                value={formData.stock}
                onChange={handleChange}
                className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-emerald-600 transition"
                required
              />
            </div>
            <input
              name="image"
              placeholder="Link ảnh (URL)"
              value={formData.image}
              onChange={handleChange}
              className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
            />
            <textarea
              name="description"
              placeholder="Mô tả sản phẩm"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
              rows="3"
            />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm appearance-none transition"
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className={`flex-1 text-white py-3 rounded-2xl font-bold transition shadow-md ${isEditing ? "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"}`}
              >
                {isEditing ? "Cập nhật" : "Lưu sản phẩm"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    resetForm();
                    setCurrentProduct(null);
                  }}
                  className="bg-gray-100 px-6 rounded-2xl text-gray-600 hover:bg-gray-200 font-bold transition"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* DANH SÁCH BÊN PHẢI */}
      <div className="lg:col-span-2">
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Kho Sản Phẩm</h1>
            <span className="text-sm font-bold bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-100">
              Trang {page} / {pages}
            </span>
          </div>

          <div className="space-y-5">
            {products.map((p) => {
              const displayStock =
                p.stock !== undefined ? p.stock : p.countInStock || 0;
              return (
                <div
                  key={p._id}
                  className="flex flex-col sm:flex-row items-center bg-gray-50/80 border border-gray-100 p-4 rounded-[1.5rem] hover:shadow-md transition gap-5"
                >
                  <img
                    src={p.image || "https://via.placeholder.com/80"}
                    className="w-24 h-24 object-cover rounded-2xl bg-white p-1 border border-gray-100"
                    alt=""
                  />

                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-800 text-lg line-clamp-1">
                        {p.name}
                      </h3>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 uppercase whitespace-nowrap">
                        {p.category?.name}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1 mb-4 line-clamp-1">
                      {p.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-5">
                      <span className="text-emerald-600 font-bold text-lg">
                        {new Intl.NumberFormat("vi-VN").format(p.price)}đ
                      </span>
                      <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => handleQuickStock(p, -1)}
                          className="px-3 py-1.5 hover:bg-gray-50 text-gray-500 font-bold border-r"
                        >
                          -
                        </button>
                        <span
                          className={`px-4 text-sm font-bold ${displayStock > 0 ? "text-gray-800" : "text-red-500"}`}
                        >
                          {displayStock}
                        </span>
                        <button
                          onClick={() => handleQuickStock(p, 1)}
                          className="px-3 py-1.5 hover:bg-gray-50 text-gray-500 font-bold border-l"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleEdit(p)}
                      className="flex-1 bg-white border border-blue-100 text-blue-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition shadow-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="flex-1 bg-white border border-red-100 text-red-500 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition shadow-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}

            {products.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">
                  Không tìm thấy sản phẩm nào.
                </p>
              </div>
            )}
          </div>

          {/* Phân trang */}
          {pages > 1 && (
            <div className="flex justify-center mt-10 gap-3">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-5 py-2.5 rounded-xl font-bold bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50 transition shadow-sm"
              >
                ← Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pages))}
                disabled={page === pages}
                className="px-5 py-2.5 rounded-xl font-bold bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50 transition shadow-sm"
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
