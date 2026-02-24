import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const PLACEHOLDER = "https://via.placeholder.com/600x600?text=No+Image";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // 👇 STATE CHO BIẾN THỂ
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    setQuantity(1);
    setRating(5);
    setComment("");
    setSelectedSize("");
    setSelectedColor("");

    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

  const realStock = product?.stock || 0;

  const handleQty = (amount) => {
    setQuantity((prev) => {
      const next = prev + amount;
      if (next > realStock) return realStock;
      if (next < 1) return 1;
      return next;
    });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      toast.success("Đã gửi đánh giá!");
      setComment("");
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi gửi đánh giá");
    }
  };

  // 👇 HÀM XỬ LÝ THÊM VÀO GIỎ AN TOÀN
  const handleAddToCart = (isBuyNow = false) => {
    // Gọi hàm addToCart từ Context (Hàm này phải trả về true/false)
    const success = addToCart(product, quantity, selectedSize, selectedColor);

    if (success) {
      if (isBuyNow) {
        navigate("/cart"); // Nếu mua ngay và thành công -> Chuyển trang
      } else {
        toast.success("Đã thêm vào giỏ hàng! 🛒"); // Nếu chỉ thêm -> Báo thành công
      }
    }
    // Nếu success = false (chưa chọn size/màu), CartContext đã tự báo lỗi rồi, không làm gì cả.
  };

  if (!product) return <div className="text-center mt-20">Đang tải...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-gray-500 hover:text-black"
      >
        ← Quay lại
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 rounded shadow mb-10">
        <div className="aspect-square bg-gray-100 rounded overflow-hidden">
          <img
            src={product.image || PLACEHOLDER}
            onError={(e) => (e.target.src = PLACEHOLDER)}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <p className="text-blue-600 font-bold uppercase">
            {product.category?.name}
          </p>
          <h1 className="text-3xl font-bold my-2">{product.name}</h1>
          <div className="flex text-yellow-400 mb-4 text-sm">
            {"★".repeat(Math.round(product.rating || 0))}
            <span className="text-gray-400 ml-2">
              ({product.numReviews} đánh giá)
            </span>
          </div>
          <p className="text-3xl text-red-600 font-bold mb-6">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(product.price)}
          </p>
          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* 👇 CHỌN MÀU SẮC */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-4">
              <span className="font-bold mr-2">Màu sắc:</span>
              <div className="flex gap-2 mt-1">
                {product.colors.map((c, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1 border rounded ${
                      selectedColor === c
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 👇 CHỌN KÍCH CỠ */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <span className="font-bold mr-2">Kích cỡ:</span>
              <div className="flex gap-2 mt-1">
                {product.sizes.map((s, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(s)}
                    className={`w-10 h-10 border rounded flex items-center justify-center ${
                      selectedSize === s
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SỐ LƯỢNG */}
          <div className="flex items-center gap-4 mb-6">
            <span className="font-bold">Số lượng:</span>
            {realStock > 0 ? (
              <>
                <div className="flex border rounded">
                  <button
                    onClick={() => handleQty(-1)}
                    className="px-3 bg-gray-100 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <input
                    value={quantity}
                    readOnly
                    className="w-10 text-center font-bold bg-white"
                  />
                  <button
                    onClick={() => handleQty(1)}
                    className="px-3 bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
                <span className="text-green-600 font-bold text-sm">
                  Còn {realStock} sản phẩm
                </span>
              </>
            ) : (
              <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded">
                HẾT HÀNG
              </span>
            )}
          </div>

          {/* NÚT MUA (Đã sửa logic) */}
          <div className="flex gap-4">
            <button
              onClick={() => handleAddToCart(false)} // false = Chỉ thêm, không chuyển trang
              disabled={realStock === 0}
              className="flex-1 bg-black text-white py-3 rounded font-bold hover:bg-gray-800 disabled:bg-gray-400"
            >
              THÊM VÀO GIỎ
            </button>
            <button
              onClick={() => handleAddToCart(true)} // true = Mua ngay -> Chuyển trang
              disabled={realStock === 0}
              className="flex-1 bg-red-600 text-white py-3 rounded font-bold hover:bg-red-700 disabled:bg-gray-400"
            >
              MUA NGAY
            </button>
          </div>
        </div>
      </div>

      {/* Review Section (Giữ nguyên) */}
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h3 className="font-bold text-xl mb-4 border-l-4 border-blue-600 pl-3">
            ĐÁNH GIÁ KHÁCH HÀNG
          </h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {product.reviews.length === 0 && (
              <p className="text-gray-500">Chưa có đánh giá nào.</p>
            )}
            {product.reviews.map((r) => (
              <div key={r._id} className="bg-white p-3 border rounded">
                <div className="flex justify-between font-bold">
                  <span>{r.name}</span>{" "}
                  <span className="text-yellow-500">
                    {"★".repeat(r.rating)}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-xl mb-4 border-l-4 border-yellow-500 pl-3">
            VIẾT ĐÁNH GIÁ
          </h3>
          {user ? (
            <form
              onSubmit={submitReview}
              className="bg-white p-4 border rounded shadow-sm"
            >
              <div className="mb-2">
                <label className="block text-sm font-bold">Số sao:</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  {[5, 4, 3, 2, 1].map((s) => (
                    <option key={s} value={s}>
                      {s} Sao
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label className="block text-sm font-bold">Nội dung:</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
                Gửi đánh giá
              </button>
            </form>
          ) : (
            <p className="bg-gray-100 p-4 text-center rounded">
              Vui lòng{" "}
              <Link to="/login" className="text-blue-600 font-bold">
                đăng nhập
              </Link>{" "}
              để đánh giá.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
