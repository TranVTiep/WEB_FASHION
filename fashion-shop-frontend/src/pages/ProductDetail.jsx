import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Thêm useNavigate
import api from "../api/axios";
import { useCart } from "../context/CartContext";

// Ảnh thay thế nếu link ảnh chết
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/600x600?text=No+Image";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook chuyển trang
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1); // 👇 State lưu số lượng khách chọn
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Xử lý tăng giảm số lượng
  const handleQuantityChange = (amount) => {
    setQuantity((prev) => {
      const newQty = prev + amount;
      return newQty < 1 ? 1 : newQty; // Không cho nhỏ hơn 1
    });
  };

  // Mua ngay = Thêm vào giỏ -> Chuyển đến trang thanh toán
  const handleBuyNow = async () => {
    await addToCart(product, quantity);
    navigate("/cart");
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-500">
        Đang tải chi tiết... ⏳
      </div>
    );
  if (!product)
    return (
      <div className="text-center mt-20 text-red-500">
        Không tìm thấy sản phẩm ❌
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Breadcrumb nhỏ xinh */}
      <button
        onClick={() => navigate(-1)}
        className="text-gray-500 hover:text-black mb-6 flex items-center gap-1 text-sm"
      >
        ← Quay lại
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 rounded-xl shadow-sm border">
        {/* CỘT TRÁI: ẢNH SẢN PHẨM */}
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group">
          <img
            src={product.image || PLACEHOLDER_IMAGE}
            onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            alt={product.name}
          />
        </div>

        {/* CỘT PHẢI: THÔNG TIN */}
        <div className="flex flex-col justify-center">
          <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">
            {product.category?.name || "Sản phẩm mới"}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            {product.name}
          </h1>

          <p className="text-3xl text-red-600 font-bold mb-6 border-b pb-6 border-gray-100">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(product.price)}
          </p>

          <p className="text-gray-600 leading-relaxed mb-8">
            {product.description || "Chưa có mô tả cho sản phẩm này."}
          </p>

          {/* 👇 BỘ CHỌN SỐ LƯỢNG */}
          <div className="flex items-center gap-4 mb-8">
            <span className="font-bold text-gray-700">Số lượng:</span>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition active:bg-gray-300"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                readOnly
                className="w-12 text-center py-2 focus:outline-none font-bold bg-white"
              />
              <button
                onClick={() => handleQuantityChange(1)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition active:bg-gray-300"
              >
                +
              </button>
            </div>
          </div>

          {/* NÚT BẤM */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <button
              onClick={() => addToCart(product, quantity)}
              className="flex-1 bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2"
            >
              🛒 THÊM VÀO GIỎ
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 bg-red-600 text-white py-4 rounded-lg font-bold hover:bg-red-700 transition shadow-lg"
            >
              MUA NGAY
            </button>
          </div>

          {/* CAM KẾT */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              ✅ Hàng chính hãng 100%
            </div>
            <div className="flex items-center gap-2">
              🚀 Giao hàng nhanh toàn quốc
            </div>
            <div className="flex items-center gap-2">
              🔄 Đổi trả trong 7 ngày
            </div>
            <div className="flex items-center gap-2">📞 Hỗ trợ 24/7</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
