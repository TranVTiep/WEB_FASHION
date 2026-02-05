import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-10 pb-6 mt-10 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Cột 1: Thông tin */}
        <div>
          <h2 className="text-2xl font-bold tracking-wider mb-4">
            FashionShop
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Nơi cập nhật xu hướng thời trang mới nhất. Chất lượng hàng đầu,
            phong cách riêng biệt.
          </p>
        </div>

        {/* Cột 2: Liên kết nhanh */}
        <div>
          <h3 className="text-lg font-bold mb-4">Mua sắm</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link to="/products" className="hover:text-white transition">
                Tất cả sản phẩm
              </Link>
            </li>
            <li>
              <Link
                to="/products?category=ao"
                className="hover:text-white transition"
              >
                Áo nam/nữ
              </Link>
            </li>
            <li>
              <Link
                to="/products?category=quan"
                className="hover:text-white transition"
              >
                Quần thời trang
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-white transition">
                Giỏ hàng
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ */}
        <div>
          <h3 className="text-lg font-bold mb-4">Hỗ trợ</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link to="#" className="hover:text-white transition">
                Chính sách đổi trả
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-white transition">
                Bảo mật thông tin
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-white transition">
                Tra cứu đơn hàng
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-white transition">
                Liên hệ
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 4: Newsletter */}
        <div>
          <h3 className="text-lg font-bold mb-4">Đăng ký nhận tin</h3>
          <p className="text-gray-400 text-sm mb-3">
            Nhận mã giảm giá 10% cho đơn hàng đầu tiên.
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="w-full px-3 py-2 bg-gray-800 text-white text-sm outline-none focus:ring-1 focus:ring-gray-500 rounded-l"
            />
            <button className="bg-white text-black px-4 py-2 text-sm font-bold hover:bg-gray-200 rounded-r transition">
              GỬI
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-600 text-xs mt-10 pt-6 border-t border-gray-900">
        © 2026 FashionShop. All rights reserved.
      </div>
    </footer>
  );
}
