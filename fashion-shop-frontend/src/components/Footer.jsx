import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white pt-16 pb-8 mt-16 border-t border-emerald-50">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-emerald-600 mb-4">
            Eco<span className="text-gray-800">Fashion</span>
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Nơi cập nhật xu hướng thời trang mới nhất. Thân thiện với môi
            trường, thiết kế tối giản, phong cách riêng biệt.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Mua sắm</h3>
          <ul className="space-y-3 text-sm text-gray-500">
            <li>
              <Link
                to="/products"
                className="hover:text-emerald-500 transition"
              >
                Tất cả sản phẩm
              </Link>
            </li>
            <li>
              <Link
                to="/products?category=ao"
                className="hover:text-emerald-500 transition"
              >
                Áo nam/nữ
              </Link>
            </li>
            <li>
              <Link
                to="/products?category=quan"
                className="hover:text-emerald-500 transition"
              >
                Quần thời trang
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-emerald-500 transition">
                Giỏ hàng
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Hỗ trợ</h3>
          <ul className="space-y-3 text-sm text-gray-500">
            <li>
              <Link to="#" className="hover:text-emerald-500 transition">
                Chính sách đổi trả
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-emerald-500 transition">
                Bảo mật thông tin
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-emerald-500 transition">
                Tra cứu đơn hàng
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-emerald-500 transition">
                Liên hệ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Đăng ký nhận tin
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Nhận mã giảm giá 10% cho đơn hàng đầu tiên.
          </p>
          <div className="flex bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 p-1 focus-within:border-emerald-500 transition">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="w-full px-4 py-2 bg-transparent text-gray-700 text-sm outline-none"
            />
            <button className="bg-emerald-500 text-white px-6 py-2 text-sm font-bold rounded-xl hover:bg-emerald-600 transition shadow-sm">
              GỬI
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-400 text-sm mt-16 pt-8 border-t border-gray-100">
        © 2026 EcoFashion. All rights reserved.
      </div>
    </footer>
  );
}
