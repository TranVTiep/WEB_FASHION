import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const searchInputRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {}
    };
    fetchCategories();
  }, []);

  const fetchProducts = async (
    searchVal = "",
    catVal = selectedCategory,
    pageNum = 1,
  ) => {
    setLoading(true);
    try {
      const res = await api.get("/products", {
        params: { keyword: searchVal, category: catVal, pageNumber: pageNum },
      });
      setProducts(res.data.products);
      setPages(res.data.pages);
      setPage(res.data.page);
    } catch (err) {
      toast.error("Lỗi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentKeyword = searchInputRef.current
      ? searchInputRef.current.value
      : "";
    fetchProducts(currentKeyword, selectedCategory, page);
  }, [selectedCategory, page]);

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(searchInputRef.current.value, selectedCategory, 1);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      <div className="text-center mb-12 mt-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Tất cả sản phẩm
        </h1>
        <p className="text-gray-500">
          Khám phá phong cách tối giản dành riêng cho bạn
        </p>
      </div>

      {/* BỘ LỌC & TÌM KIẾM */}
      <div className="mb-10 flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-emerald-50">
        <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          <button
            onClick={() => handleCategoryClick("")}
            className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === ""
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                : "bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat._id)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat._id
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                  : "bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full bg-gray-50 px-5 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
            ref={searchInputRef}
          />
          <button
            type="submit"
            className="bg-emerald-500 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-emerald-600 transition shadow-sm"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* DANH SÁCH SẢN PHẨM */}
      {loading ? (
        <div className="text-center py-20 text-emerald-500 font-medium">
          Đang tải sản phẩm... 🌿
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
          <p className="text-gray-500">Không tìm thấy sản phẩm nào! 😢</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50 p-4">
                  <img
                    src={product.image || "https://via.placeholder.com/300"}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.countInStock === 0 && (
                    <span className="absolute top-6 left-6 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Hết hàng
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-emerald-500 font-bold mb-1 uppercase">
                    {product.category?.name}
                  </p>
                  <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">
                    {product.name}
                  </h3>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-emerald-600 font-bold text-lg">
                      {new Intl.NumberFormat("vi-VN").format(product.price)}đ
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(
                          product,
                          1,
                          product.sizes?.[0] || "M",
                          product.colors?.[0] || "Basic",
                        );
                        toast.success("Đã thêm! 🌿");
                      }}
                      disabled={product.countInStock === 0}
                      className="bg-emerald-50 text-emerald-600 h-10 w-10 rounded-2xl flex items-center justify-center font-bold hover:bg-emerald-500 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex justify-center mt-12 gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-5 py-2.5 rounded-2xl font-bold bg-white text-gray-600 shadow-sm disabled:opacity-50 hover:bg-emerald-50 hover:text-emerald-600 transition"
              >
                Trở lại
              </button>
              <span className="px-5 py-2.5 font-bold bg-emerald-500 text-white rounded-2xl shadow-sm">
                {page} / {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pages))}
                disabled={page === pages}
                className="px-5 py-2.5 rounded-2xl font-bold bg-white text-gray-600 shadow-sm disabled:opacity-50 hover:bg-emerald-50 hover:text-emerald-600 transition"
              >
                Tiếp theo
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
