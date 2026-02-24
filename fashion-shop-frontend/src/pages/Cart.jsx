import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Cart() {
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

  const calculateTotal = () =>
    cart.reduce(
      (acc, item) =>
        selectedItems.includes(
          `${item._id}_${item.selectedSize}_${item.selectedColor}`,
        )
          ? acc + item.price * item.quantity
          : acc,
      0,
    );

  const handleCheckout = () => {
    if (selectedItems.length === 0)
      return toast.error("Vui lòng chọn sản phẩm!");
    if (!user) return navigate("/login");
    navigate("/checkout");
  };

  if (cart.length === 0)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mb-6">
          🛒
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Giỏ hàng trống
        </h2>
        <Link
          to="/products"
          className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-600 transition shadow-md"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center">
        Giỏ Hàng Của Bạn
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <input
              type="checkbox"
              className="w-5 h-5 accent-emerald-500"
              checked={selectedItems.length === cart.length}
              onChange={toggleSelectAll}
            />
            <span className="font-bold text-gray-700">
              Chọn tất cả ({cart.length} sản phẩm)
            </span>
          </div>

          {cart.map((item, idx) => (
            <div
              key={idx}
              className={`flex gap-6 p-5 rounded-3xl transition-all border ${selectedItems.includes(`${item._id}_${item.selectedSize}_${item.selectedColor}`) ? "border-emerald-200 bg-white shadow-md" : "border-gray-100 bg-gray-50"}`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-emerald-500"
                  checked={selectedItems.includes(
                    `${item._id}_${item.selectedSize}_${item.selectedColor}`,
                  )}
                  onChange={() =>
                    toggleSelectItem(
                      item._id,
                      item.selectedSize,
                      item.selectedColor,
                    )
                  }
                />
              </div>
              <img
                src={item.image}
                className="w-28 h-28 object-cover rounded-2xl bg-white p-2 border border-gray-100"
                alt={item.name}
              />
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Size: {item.selectedSize} | Màu: {item.selectedColor}
                  </p>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-emerald-600 font-bold text-xl">
                    {new Intl.NumberFormat("vi-VN").format(item.price)}đ
                  </span>
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item._id,
                          item.selectedSize,
                          item.selectedColor,
                          -1,
                        )
                      }
                      className="w-8 h-8 rounded-lg hover:bg-white font-bold"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold">
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
                      className="w-8 h-8 rounded-lg hover:bg-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  removeFromCart(
                    item._id,
                    item.selectedSize,
                    item.selectedColor,
                  )
                }
                className="text-gray-400 hover:text-red-500 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="md:col-span-1">
          <div className="bg-emerald-50 p-8 rounded-[2.5rem] sticky top-28 border border-emerald-100">
            <h2 className="font-bold text-2xl mb-6 text-gray-800">Tóm Tắt</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Sản phẩm:</span>
                <span className="font-bold text-gray-800">
                  {selectedItems.length}
                </span>
              </div>
              <div className="flex justify-between text-xl pt-6 border-t border-emerald-200/50">
                <span className="font-bold text-gray-800">Tổng:</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {new Intl.NumberFormat("vi-VN").format(calculateTotal())}đ
                </span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-200 uppercase tracking-wide"
            >
              Thanh Toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
