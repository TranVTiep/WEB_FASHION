import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {}
    };
    fetchProduct();
  }, [id]);

  const handleQty = (amount) => {
    setQuantity((prev) =>
      Math.max(1, Math.min(prev + amount, product?.stock || 0)),
    );
  };

  const handleAddToCart = (isBuyNow = false) => {
    if (addToCart(product, quantity, selectedSize, selectedColor)) {
      if (isBuyNow) navigate("/cart");
      else toast.success("Đã thêm vào giỏ hàng! 🌿");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      toast.success("Cảm ơn bạn đã đánh giá!");
      setComment("");
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      toast.error("Lỗi gửi đánh giá");
    }
  };

  if (!product)
    return (
      <div className="text-center mt-20 text-emerald-500 font-medium">
        Đang tải chi tiết...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-500 hover:text-emerald-600 font-medium transition"
      >
        <span>←</span> Quay lại
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-[2.5rem] shadow-sm mb-12 border border-emerald-50">
        <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden p-4">
          <img
            src={product.image}
            className="w-full h-full object-cover rounded-2xl"
            alt={product.name}
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-emerald-500 font-bold uppercase tracking-wider text-sm mb-2">
            {product.category?.name}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 text-yellow-400 mb-6">
            {"★".repeat(Math.round(product.rating || 0))}
            <span className="text-gray-400 text-sm font-medium">
              ({product.numReviews} đánh giá)
            </span>
          </div>

          <p className="text-4xl text-emerald-600 font-bold mb-6">
            {new Intl.NumberFormat("vi-VN").format(product.price)}đ
          </p>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {product.description}
          </p>

          {/* Chọn Size / Màu */}
          <div className="space-y-6 mb-8">
            {product.colors?.length > 0 && (
              <div>
                <span className="font-bold text-gray-800 block mb-3">
                  Màu sắc
                </span>
                <div className="flex gap-3">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-5 py-2 rounded-xl font-medium transition ${selectedColor === c ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" : "bg-gray-50 text-gray-600 hover:bg-emerald-50"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {product.sizes?.length > 0 && (
              <div>
                <span className="font-bold text-gray-800 block mb-3">
                  Kích cỡ
                </span>
                <div className="flex gap-3">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-12 h-12 rounded-xl font-medium transition flex items-center justify-center ${selectedSize === s ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" : "bg-gray-50 text-gray-600 hover:bg-emerald-50"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 mb-8">
            <span className="font-bold text-gray-800">Số lượng:</span>
            {product.stock > 0 ? (
              <div className="flex items-center bg-gray-50 rounded-2xl p-1">
                <button
                  onClick={() => handleQty(-1)}
                  className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-sm font-bold transition"
                >
                  -
                </button>
                <input
                  value={quantity}
                  readOnly
                  className="w-12 text-center font-bold bg-transparent outline-none"
                />
                <button
                  onClick={() => handleQty(1)}
                  className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-sm font-bold transition"
                >
                  +
                </button>
              </div>
            ) : (
              <span className="text-red-500 font-bold bg-red-50 px-4 py-2 rounded-xl">
                HẾT HÀNG
              </span>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleAddToCart(false)}
              disabled={product.stock === 0}
              className="flex-1 bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-bold hover:bg-emerald-100 transition disabled:opacity-50"
            >
              THÊM VÀO GIỎ
            </button>
            <button
              onClick={() => handleAddToCart(true)}
              disabled={product.stock === 0}
              className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-200 disabled:opacity-50"
            >
              MUA NGAY
            </button>
          </div>
        </div>
      </div>

      {/* Đánh giá rút gọn cho ngắn mã */}
    </div>
  );
}
