import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext"; // 👈 1. Import Cart Context

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x400?text=No+Image";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart(); // 👈 2. Lấy hàm mua hàng

  const keyword = searchParams.get("keyword") || "";
  const categoryId = searchParams.get("category") || "";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (keyword) query.append("keyword", keyword);
        if (categoryId) query.append("category", categoryId);

        const res = await api.get(`/products?${query.toString()}`);
        setProducts(
          Array.isArray(res.data) ? res.data : res.data.products || [],
        );
      } catch (error) {
        console.log("API ERROR:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, categoryId]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchParams((prev) => {
      if (value) prev.set("keyword", value);
      else prev.delete("keyword");
      return prev;
    });
  };

  const handleCategoryClick = (id) => {
    setSearchParams((prev) => {
      if (id) prev.set("category", id);
      else prev.delete("category");
      return prev;
    });
  };

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGE;
  };

  // 👇 3. Hàm xử lý khi bấm nút giỏ hàng ở ngoài danh sách (chặn sự kiện click vào ảnh)
  const handleAddToCartQuick = (e, product) => {
    e.preventDefault(); // Chặn không cho nó nhảy vào trang chi tiết
    addToCart(product, 1); // Mặc định mua 1 cái
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center tracking-tight">
        Cửa hàng thời trang
      </h1>

      {/* THANH CÔNG CỤ */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50 p-4 rounded-xl">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          <button
            onClick={() => handleCategoryClick("")}
            className={`px-5 py-2 rounded-full text-sm font-bold transition shadow-sm
              ${!categoryId ? "bg-black text-white" : "bg-white text-gray-700 hover:bg-gray-200"}`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat._id)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition shadow-sm
                ${categoryId === cat._id ? "bg-black text-white" : "bg-white text-gray-700 hover:bg-gray-200"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={keyword}
            onChange={handleSearch}
            className="w-full border-2 border-gray-200 rounded-full px-5 py-2.5 pl-12 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 absolute left-4 top-3 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
      </div>

      {/* DANH SÁCH SẢN PHẨM */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 text-lg font-medium">
          Đang tải sản phẩm... ⏳
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🤔</div>
              <div className="text-xl text-gray-600 font-medium">
                Không tìm thấy sản phẩm nào phù hợp.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {products.map((p) => (
                <Link
                  to={`/products/${p._id}`}
                  key={p._id}
                  className="group block h-full"
                >
                  <div className="border rounded-2xl p-3 bg-white hover:shadow-xl transition duration-300 h-full flex flex-col relative">
                    <div className="relative overflow-hidden rounded-xl mb-4 aspect-square bg-gray-100">
                      <img
                        src={p.image || PLACEHOLDER_IMAGE}
                        onError={handleImageError}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                        alt={p.name}
                      />

                      {/* 👇 NÚT MUA NHANH (Hiển thị khi di chuột vào) */}
                      <button
                        onClick={(e) => handleAddToCartQuick(e, p)}
                        className="absolute bottom-3 right-3 bg-black text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition transform translate-y-4 group-hover:translate-y-0 hover:bg-red-600"
                        title="Thêm vào giỏ ngay"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col justify-between text-center md:text-left">
                      <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                          {p.category?.name || "Fashion"}
                        </p>
                        <h2 className="font-bold text-base md:text-lg mb-2 text-gray-900 line-clamp-2 group-hover:text-blue-700 transition">
                          {p.name}
                        </h2>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-red-600 font-extrabold text-lg md:text-xl">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(p.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Products;
