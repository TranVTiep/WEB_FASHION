import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Cart = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    selectedItems,
    toggleSelectItem,
    toggleSelectAll,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // 👇 TÍNH TỔNG TIỀN (CHỈ NHỮNG MÓN ĐƯỢC CHỌN)
  const total = cart.reduce((acc, item) => {
    const key = `${item._id}_${item.selectedSize}_${item.selectedColor}`;
    if (selectedItems.includes(key)) {
      return acc + item.price * item.quantity;
    }
    return acc;
  }, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Bạn chưa chọn sản phẩm nào để thanh toán!");
      return;
    }

    if (!user) {
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Giỏ hàng trống
        </h2>
        <Link
          to="/"
          className="bg-black text-white px-6 py-3 rounded font-bold hover:bg-gray-800"
        >
          MUA SẮM NGAY
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 border-l-4 border-black pl-4">
        GIỎ HÀNG
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {/* CHECKBOX CHỌN TẤT CẢ */}
          <div className="flex items-center gap-3 bg-white p-3 rounded shadow border mb-2">
            <input
              type="checkbox"
              className="w-5 h-5 cursor-pointer accent-black"
              checked={
                selectedItems.length > 0 && selectedItems.length === cart.length
              }
              onChange={toggleSelectAll}
            />
            <span className="font-bold text-gray-700">
              Chọn tất cả ({cart.length} sản phẩm)
            </span>
          </div>

          {cart.map((item, index) => {
            const key = `${item._id}_${item.selectedSize}_${item.selectedColor}`;
            const isSelected = selectedItems.includes(key);

            return (
              <div
                key={index}
                className={`flex gap-4 bg-white p-4 rounded shadow border items-center relative transition ${isSelected ? "border-black bg-gray-50" : ""}`}
              >
                {/* 👇 CHECKBOX TỪNG MÓN */}
                <input
                  type="checkbox"
                  className="w-5 h-5 cursor-pointer accent-black"
                  checked={isSelected}
                  onChange={() =>
                    toggleSelectItem(
                      item._id,
                      item.selectedSize,
                      item.selectedColor,
                    )
                  }
                />

                <button
                  onClick={() =>
                    removeFromCart(
                      item._id,
                      item.selectedSize,
                      item.selectedColor,
                    )
                  }
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 font-bold"
                >
                  ✕
                </button>

                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />

                <div className="flex-1">
                  <Link
                    to={`/products/${item._id}`}
                    className="font-bold text-lg hover:text-blue-600"
                  >
                    {item.name}
                  </Link>

                  <div className="flex gap-3 text-sm text-gray-500 mt-1 mb-2">
                    {item.selectedSize && (
                      <span className="bg-gray-100 px-2 rounded border">
                        Size: <b>{item.selectedSize}</b>
                      </span>
                    )}
                    {item.selectedColor && (
                      <span className="bg-gray-100 px-2 rounded border">
                        Màu: <b>{item.selectedColor}</b>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-red-600 font-bold">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.price)}
                    </p>

                    <div className="flex border rounded items-center bg-white">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item._id,
                            item.selectedSize,
                            item.selectedColor,
                            -1,
                          )
                        }
                        className="px-3 py-1 bg-gray-50 hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="px-3 font-bold text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item._id,
                            item.selectedSize,
                            item.selectedColor,
                            1,
                          )
                        }
                        className="px-3 py-1 bg-gray-50 hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CỘT TỔNG TIỀN */}
        <div className="bg-white p-6 rounded shadow border h-fit sticky top-20">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Thanh toán</h2>
          <div className="flex justify-between mb-2">
            <span>Đã chọn:</span>
            <span className="font-bold">{selectedItems.length} sản phẩm</span>
          </div>
          <div className="flex justify-between mb-6 text-lg">
            <span>Tổng cộng:</span>
            <span className="font-bold text-red-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(total)}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={selectedItems.length === 0}
            className={`w-full py-3 rounded font-bold uppercase transition ${selectedItems.length > 0 ? "bg-black text-white hover:bg-gray-800" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
          >
            Mua Hàng ({selectedItems.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
