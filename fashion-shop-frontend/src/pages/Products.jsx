import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State danh mục
  const [selectedCategory, setSelectedCategory] = useState("");

  // --- 1. THÊM STATE PHÂN TRANG ---
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  // --------------------------------

  // Ref cho ô tìm kiếm
  const searchInputRef = useRef(null);

  const { addToCart } = useCart();

  // Lấy danh mục
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

  // --- 2. HÀM LẤY SẢN PHẨM (ĐÃ CẬP NHẬT) ---
  // Nhận thêm tham số pageNum
  const fetchProducts = async (
    searchVal = "",
    catVal = selectedCategory,
    pageNum = 1,
  ) => {
    setLoading(true);
    try {
      const res = await api.get("/products", {
        params: {
          keyword: searchVal,
          category: catVal,
          pageNumber: pageNum, // Gửi trang cần lấy lên server
        },
      });

      // Backend trả về object: { products: [], page: 1, pages: 10 }
      setProducts(res.data.products);
      setPages(res.data.pages);
      setPage(res.data.page);
    } catch (err) {
      toast.error("Lỗi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. TỰ ĐỘNG GỌI API KHI CHỌN DANH MỤC HOẶC ĐỔI TRANG ---
  useEffect(() => {
    const currentKeyword = searchInputRef.current
      ? searchInputRef.current.value
      : "";

    // Gọi hàm fetch với keyword, category và page hiện tại
    fetchProducts(currentKeyword, selectedCategory, page);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, page]); // Thêm 'page' vào đây để khi bấm chuyển trang nó tự load lại

  // Hàm xử lý khi bấm chọn danh mục (Reset về trang 1)
  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    setPage(1); // Quan trọng: Đổi danh mục thì phải về trang đầu
  };

  // --- 4. XỬ LÝ TÌM KIẾM ---
  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = searchInputRef.current.value;
    setPage(1); // Tìm kiếm mới -> Về trang 1
    fetchProducts(keyword, selectedCategory, 1);
  };

  // --- 5. XỬ LÝ KHI XÓA TRẮNG Ô INPUT ---
  const handleInputChange = (e) => {
    if (e.target.value === "") {
      setPage(1);
      fetchProducts("", selectedCategory, 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center uppercase">
        Tất cả sản phẩm
      </h1>

      {/* --- BỘ LỌC & TÌM KIẾM --- */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => handleCategoryClick("")}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition
              ${selectedCategory === "" ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-300 hover:border-black"}`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat._id)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition
                ${selectedCategory === cat._id ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-300 hover:border-black"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
          <input
            type="text"
            placeholder="Tìm kiếm..."
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
        </div>
      ) : (
        <>
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
                    // Xử lý ảnh lỗi
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/300")
                    }
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

                  <p className="text-sm text-gray-500 mb-3 line-clamp-2 min-h-[40px]">
                    {product.description || "Sản phẩm chưa có mô tả."}
                  </p>

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

          {/* --- 6. NÚT PHÂN TRANG (MỚI) --- */}
          {pages > 1 && (
            <div className="flex justify-center mt-10 space-x-2 pb-8">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`px-4 py-2 border rounded font-bold transition ${
                  page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-black hover:text-white"
                }`}
              >
                ← Trước
              </button>

              <span className="px-4 py-2 font-bold bg-gray-100 rounded text-gray-700">
                Trang {page} / {pages}
              </span>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
                disabled={page === pages}
                className={`px-4 py-2 border rounded font-bold transition ${
                  page === pages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-black hover:text-white"
                }`}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
