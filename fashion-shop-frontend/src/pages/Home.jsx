import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State danh mục
  const [selectedCategory, setSelectedCategory] = useState("");

  // Dùng useRef cho ô tìm kiếm
  const searchInputRef = useRef(null);

  const { addToCart } = useCart();

  // 1. Lấy danh sách danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh mục");
      }
    };
    fetchCategories();
  }, []);

  // 2. Hàm lấy sản phẩm
  const fetchProducts = async (searchVal = "", catVal = selectedCategory) => {
    setLoading(true);
    try {
      const res = await api.get("/products", {
        params: {
          keyword: searchVal,
          category: catVal,
        },
      });
      setProducts(res.data);
    } catch (err) {
      toast.error("Lỗi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // 3. Tự động gọi API khi chọn danh mục
  useEffect(() => {
    const currentKeyword = searchInputRef.current
      ? searchInputRef.current.value
      : "";
    fetchProducts(currentKeyword, selectedCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // 4. Xử lý khi bấm nút "Tìm kiếm"
  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = searchInputRef.current.value;
    fetchProducts(keyword, selectedCategory);
  };

  // 5. Xử lý khi thay đổi ô input (Xóa trắng -> Tự reset)
  const handleInputChange = (e) => {
    if (e.target.value === "") {
      fetchProducts("", selectedCategory);
    }
  };

  // 6. Xử lý Reset toàn bộ
  const handleReset = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
    setSelectedCategory("");
    fetchProducts("", "");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* --- PHẦN TÌM KIẾM & LỌC --- */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm">
        {/* Bộ lọc Danh mục */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition
              ${selectedCategory === "" ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-300 hover:border-black"}`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition
                ${selectedCategory === cat._id ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-300 hover:border-black"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Ô Tìm kiếm */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-black"
            ref={searchInputRef}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded font-bold hover:bg-gray-800 transition"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* --- DANH SÁCH SẢN PHẨM --- */}
      {loading ? (
        <div className="text-center py-20">Đang tải sản phẩm... ⏳</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-gray-500">
            Không tìm thấy sản phẩm nào! 😢
          </h2>
          <button
            onClick={handleReset}
            className="mt-4 text-blue-600 underline"
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="group border rounded-lg overflow-hidden hover:shadow-lg transition bg-white flex flex-col"
            >
              <Link
                to={`/products/${product._id}`}
                className="block overflow-hidden relative h-64"
              >
                <img
                  src={product.image || "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />
                {product.countInStock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                    HẾT HÀNG
                  </div>
                )}
              </Link>

              <div className="p-4 flex flex-col flex-1">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                  {product.category?.name || "Uncategorized"}
                </p>

                <Link to={`/products/${product._id}`}>
                  <h3 className="font-bold text-lg mb-1 truncate group-hover:text-blue-600 transition">
                    {product.name}
                  </h3>
                </Link>

                {/* 👇 ĐOẠN MỚI THÊM: HIỂN THỊ MÔ TẢ 👇 */}
                <p className="text-sm text-gray-500 mb-3 line-clamp-2 min-h-[40px]">
                  {product.description || "Sản phẩm chưa có mô tả."}
                </p>
                {/* 👆 ------------------------------- 👆 */}

                {/* Dùng mt-auto để đẩy giá và nút mua xuống đáy thẻ */}
                <div className="flex justify-between items-center mt-auto border-t pt-3">
                  <span className="text-red-600 font-bold text-lg">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(product.price)}
                  </span>

                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.countInStock === 0}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Thêm vào giỏ"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
