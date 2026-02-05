import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const searchInputRef = useRef(null);
  const { addToCart } = useCart();

  // 👇 LINK ẢNH DỰ PHÒNG (NẾU ẢNH SẢN PHẨM BỊ LỖI HOẶC TRỐNG)
  // Dùng ảnh thời trang chung chung nhưng nghệ thuật để thay thế
  const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=764&auto=format&fit=crop";

  // 1. Lấy danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Lỗi danh mục");
      }
    };
    fetchCategories();
  }, []);

  // 2. Lấy sản phẩm
  const fetchProducts = async (searchVal = "", catVal = selectedCategory) => {
    setLoading(true);
    try {
      const res = await api.get("/products", {
        params: { keyword: searchVal, category: catVal },
      });
      setProducts(res.data);
    } catch (err) {
      toast.error("Không tải được sản phẩm");
    } finally {
      setTimeout(() => setLoading(false), 600); // Delay nhẹ để hiệu ứng mượt hơn
    }
  };

  useEffect(() => {
    const currentKeyword = searchInputRef.current
      ? searchInputRef.current.value
      : "";
    fetchProducts(currentKeyword, selectedCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(searchInputRef.current.value, selectedCategory);
  };

  const handleInputChange = (e) => {
    if (e.target.value === "") fetchProducts("", selectedCategory);
  };

  // 👇 HÀM XỬ LÝ KHI ẢNH BỊ LỖI (QUAN TRỌNG)
  const handleImageError = (e) => {
    e.target.src = FALLBACK_IMAGE; // Tự động thay thế bằng ảnh đẹp
  };

  // --- SKELETON LOADER ---
  const ProductSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-100 aspect-[3/4] w-full mb-4"></div>
      <div className="h-3 bg-gray-100 w-2/3 mb-2"></div>
      <div className="h-3 bg-gray-100 w-1/3"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* 🌟 1. HERO BANNER (Full màn hình, ảnh nét căng) */}
      <div className="relative w-full h-[90vh] overflow-hidden">
        {/* Lớp phủ tối nhẹ để chữ nổi bật */}
        <div className="absolute inset-0 bg-black/20 z-10"></div>

        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Fashion Banner"
          className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
        />

        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center text-white px-4">
          <p
            className="text-xs md:text-sm tracking-[0.5em] uppercase mb-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            New Collection 2026
          </p>
          <h1
            className="text-5xl md:text-8xl font-light tracking-tight mb-8 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            MINIMALIST
          </h1>
          <button
            onClick={() =>
              document
                .getElementById("shop")
                .scrollIntoView({ behavior: "smooth" })
            }
            className="border border-white px-10 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-500 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            Mua Ngay
          </button>
        </div>
      </div>

      <div id="shop" className="max-w-[1400px] mx-auto px-6 py-24">
        {/* 🌟 2. HEADER BỘ LỌC (Tối giản hết mức) */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-6 text-sm">
            <button
              onClick={() => setSelectedCategory("")}
              className={`uppercase tracking-widest transition-colors ${selectedCategory === "" ? "text-black border-b border-black pb-1" : "text-gray-400 hover:text-black"}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`uppercase tracking-widest transition-colors ${selectedCategory === cat._id ? "text-black border-b border-black pb-1" : "text-gray-400 hover:text-black"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input (Ẩn viền, chỉ hiện gạch chân) */}
          <form
            onSubmit={handleSearch}
            className="w-full md:w-64 border-b border-gray-200 focus-within:border-black transition-colors"
          >
            <input
              type="text"
              placeholder="TÌM KIẾM..."
              className="w-full py-2 bg-transparent text-sm uppercase tracking-wide focus:outline-none placeholder-gray-400"
              ref={searchInputRef}
              onChange={handleInputChange}
            />
          </form>
        </div>

        {/* 🌟 3. DANH SÁCH SẢN PHẨM (Grid thoáng, ảnh lớn) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {[1, 2, 3, 4].map((n) => (
              <ProductSkeleton key={n} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-gray-400 text-lg font-light italic">
              Không tìm thấy sản phẩm nào.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("");
                if (searchInputRef.current) searchInputRef.current.value = "";
                fetchProducts("", "");
              }}
              className="mt-4 text-xs font-bold uppercase tracking-widest border-b border-black"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            {products.map((product) => (
              <div key={product._id} className="group cursor-pointer">
                {/* KHUNG ẢNH: QUAN TRỌNG NHẤT */}
                {/* aspect-[3/4]: Ép ảnh theo tỉ lệ dọc chuẩn thời trang */}
                {/* overflow-hidden: Cắt phần thừa */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 mb-5">
                  <Link
                    to={`/products/${product._id}`}
                    className="block w-full h-full"
                  >
                    <img
                      src={product.image || FALLBACK_IMAGE}
                      onError={handleImageError} // 👈 Xử lý ảnh lỗi tại đây
                      alt={product.name}
                      // object-cover: Đảm bảo ảnh lấp đầy khung mà không bị méo (stretch)
                      className="w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-105"
                    />
                  </Link>

                  {/* Nút thêm giỏ hàng (Chỉ hiện khi hover) */}
                  {product.stock > 0 && (
                    <button
                      onClick={() => addToCart(product)}
                      className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-sm text-black py-4 text-xs font-bold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-black hover:text-white"
                    >
                      Thêm vào giỏ
                    </button>
                  )}

                  {product.stock === 0 && (
                    <div className="absolute top-0 left-0 w-full h-full bg-white/60 flex items-center justify-center">
                      <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase">
                        Hết hàng
                      </span>
                    </div>
                  )}
                </div>

                {/* THÔNG TIN SẢN PHẨM (Căn giữa, font mảnh) */}
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-900 mb-1 truncate px-2">
                    <Link to={`/products/${product._id}`}>{product.name}</Link>
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {product.category?.name || "Fashion"}
                  </p>
                  <p className="text-sm font-bold">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(product.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
