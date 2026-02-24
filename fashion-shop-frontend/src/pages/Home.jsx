import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const FALLBACK_IMAGE = "https://via.placeholder.com/400x400?text=No+Image";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data.products || res.data);
      } catch (err) {
        toast.error("Không tải được sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (e, product) => {
    e.preventDefault(); // Ngăn việc click vào nút bị văng sang trang chi tiết
    const size = product.sizes?.[0] || "M";
    const color = product.colors?.[0] || "Basic";
    addToCart(product, 1, size, color);
    toast.success("Đã thêm vào giỏ hàng! 🌿");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Banner */}
      <div className="bg-emerald-50 rounded-3xl mx-6 mt-6 p-10 text-center border border-emerald-100">
        <h1 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-4">
          Mùa Xanh Mới
        </h1>
        <p className="text-emerald-600 font-medium">
          Khám phá bộ sưu tập thân thiện với môi trường
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 border-l-4 border-emerald-500 pl-4">
          Sản Phẩm Nổi Bật
        </h2>

        {loading ? (
          <div className="text-center text-emerald-500 py-20 font-medium">
            Đang tải hương vị mùa xanh... 🍃
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50 p-4">
                  <img
                    src={product.image || FALLBACK_IMAGE}
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                    alt={product.name}
                  />
                  {/* Badge Hết hàng (Bo tròn) */}
                  {product.stock === 0 && (
                    <span className="absolute top-6 left-6 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Hết hàng
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-gray-800 font-semibold mb-1 truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-xs text-gray-500 font-medium">
                      {product.rating || 5.0}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <p className="text-emerald-600 font-bold text-lg">
                      {new Intl.NumberFormat("vi-VN").format(product.price)}đ
                    </p>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock === 0}
                      className="bg-emerald-50 text-emerald-600 h-10 w-10 rounded-2xl flex items-center justify-center font-bold hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
