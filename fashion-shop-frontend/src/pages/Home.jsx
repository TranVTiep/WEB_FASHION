import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Lấy 4 sản phẩm mới nhất
        const res = await api.get("/products");
        const allProducts = Array.isArray(res.data)
          ? res.data
          : res.data.products || [];
        setFeaturedProducts(allProducts.slice(0, 4)); // Chỉ lấy 4 cái đầu
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {/* 1. HERO SECTION (Banner chính) */}
      <div className="relative bg-gray-900 text-white h-[500px] flex items-center justify-center">
        {/* Ảnh nền mờ */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
            alt="Hero Banner"
            className="w-full h-full object-cover opacity-40"
          />
        </div>

        {/* Nội dung Banner */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter">
            NEW COLLECTION
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light">
            Phong cách tối giản. Đẳng cấp khác biệt.
          </p>
          <Link
            to="/products"
            className="bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-200 transition transform hover:scale-105 inline-block"
          >
            MUA SẮM NGAY
          </Link>
        </div>
      </div>

      {/* 2. LỢI ÍCH KHÁCH HÀNG (Icons) */}
      <div className="max-w-6xl mx-auto py-12 px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-b">
        <div>
          <div className="text-3xl mb-2">🚀</div>
          <h3 className="font-bold text-lg">Giao hàng miễn phí</h3>
          <p className="text-gray-500 text-sm">Cho đơn hàng trên 500k</p>
        </div>
        <div>
          <div className="text-3xl mb-2">↩️</div>
          <h3 className="font-bold text-lg">Đổi trả dễ dàng</h3>
          <p className="text-gray-500 text-sm">Trong vòng 30 ngày</p>
        </div>
        <div>
          <div className="text-3xl mb-2">🛡️</div>
          <h3 className="font-bold text-lg">Bảo mật thanh toán</h3>
          <p className="text-gray-500 text-sm">An toàn tuyệt đối</p>
        </div>
      </div>

      {/* 3. SẢN PHẨM MỚI (Featured) */}
      <div className="max-w-6xl mx-auto py-16 px-6">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Sản phẩm mới</h2>
          <Link
            to="/products"
            className="text-blue-600 hover:underline font-medium"
          >
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <Link to={`/products/${p._id}`} key={p._id} className="group">
              <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition duration-300 bg-white">
                <div className="relative overflow-hidden h-64">
                  <img
                    src={p.image || "https://via.placeholder.com/300"}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                    alt={p.name}
                  />
                  {/* Nhãn "New" */}
                  <div className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 uppercase rounded">
                    New
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {p.category?.name || "Fashion"}
                  </p>
                  <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition">
                    {p.name}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-red-600 font-bold">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(p.price)}
                    </p>
                    <span className="text-xs text-white bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                      Mua ngay
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. BANNER KHUYẾN MÃI PHỤ */}
      <div className="bg-gray-100 py-16 text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Đăng ký thành viên</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Trở thành thành viên của FashionShop để nhận ưu đãi độc quyền và tích
          điểm đổi quà.
        </p>
        <Link
          to="/register"
          className="border-2 border-black text-black px-8 py-3 rounded hover:bg-black hover:text-white transition font-bold"
        >
          ĐĂNG KÝ NGAY
        </Link>
      </div>
    </div>
  );
}
