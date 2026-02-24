import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import api from "../api/axios";
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
  const [realTimeStock, setRealTimeStock] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const checkStock = async () => {
      setIsSyncing(true);
      try {
        const stockStatus = {};
        for (const item of cart) {
          const res = await api.get(`/products/${item._id}`);
          stockStatus[item._id] = res.data.stock;
        }
        setRealTimeStock(stockStatus);
      } catch (err) {
        console.error("Lỗi cập nhật kho hàng");
      } finally {
        setIsSyncing(false);
      }
    };
    if (cart.length > 0) checkStock();
  }, [cart]);

  const isOutOfStock = (item) => {
    const currentStock = realTimeStock[item._id];
    return currentStock !== undefined && currentStock <= 0;
  };

  const calculateTotal = () =>
    cart.reduce((acc, item) => {
      const itemKey = `${item._id}_${item.selectedSize}_${item.selectedColor}`;
      if (selectedItems.includes(itemKey) && !isOutOfStock(item)) {
        return acc + item.price * item.quantity;
      }
      return acc;
    }, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0)
      return toast.warning("Vui lòng chọn ít nhất một sản phẩm!");

    const hasOutOfStock = cart.some(
      (item) =>
        selectedItems.includes(
          `${item._id}_${item.selectedSize}_${item.selectedColor}`,
        ) && isOutOfStock(item),
    );

    if (hasOutOfStock) {
      return toast.error(
        "Có sản phẩm đã hết hàng. Vui lòng kiểm tra lại giỏ hàng!",
      );
    }

    if (!user) return navigate("/login");
    navigate("/checkout");
  };

  if (cart.length === 0)
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center text-5xl animate-bounce">
            🛒
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-xl">
            ✨
          </div>
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-4">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="text-gray-500 mb-8 max-w-sm text-center">
          Hãy thêm những sản phẩm tuyệt vời vào giỏ hàng để tiếp tục hành trình
          mua sắm nhé!
        </p>
        <Link
          to="/products"
          className="bg-gray-900 text-white px-10 py-4 rounded-[2rem] font-bold hover:bg-emerald-600 transition-all shadow-xl hover:shadow-emerald-200"
        >
          Khám phá ngay
        </Link>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-[#F8FAFC]">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Giỏ Hàng <span className="text-emerald-500">.</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Bạn có {cart.length} món đồ trong danh sách
          </p>
        </div>
        <button
          onClick={toggleSelectAll}
          className="text-sm font-bold text-emerald-600 bg-emerald-50 px-6 py-2.5 rounded-2xl hover:bg-emerald-100 transition"
        >
          {selectedItems.length === cart.length
            ? "Bỏ chọn tất cả"
            : "Chọn tất cả"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* LIST ITEMS */}
        <div className="lg:col-span-2 space-y-5">
          {cart.map((item, idx) => {
            const outOfStock = isOutOfStock(item);
            const itemKey = `${item._id}_${item.selectedSize}_${item.selectedColor}`;
            const isSelected = selectedItems.includes(itemKey);

            return (
              <div
                key={idx}
                className={`group relative flex gap-6 p-6 rounded-[2.5rem] border transition-all duration-500 ${
                  outOfStock
                    ? "bg-white/50 border-red-100 grayscale-[0.8]"
                    : isSelected
                      ? "bg-white border-emerald-500 shadow-2xl shadow-emerald-100/50 scale-[1.02]"
                      : "bg-white border-transparent shadow-sm hover:shadow-md"
                }`}
              >
                {/* Checkbox ẩn hiện tinh tế */}
                <div className="flex items-center">
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        toggleSelectItem(
                          item._id,
                          item.selectedSize,
                          item.selectedColor,
                        )
                      }
                      className="peer hidden"
                      id={`check-${idx}`}
                    />
                    <label
                      htmlFor={`check-${idx}`}
                      className="w-6 h-6 border-2 border-gray-200 rounded-lg peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all cursor-pointer flex items-center justify-center text-white text-xs font-bold"
                    >
                      {isSelected && "✓"}
                    </label>
                  </div>
                </div>

                {/* Product Image */}
                <div className="relative w-32 h-32 flex-shrink-0">
                  <img
                    src={item.image}
                    className="w-full h-full object-cover rounded-[2rem] shadow-inner"
                    alt=""
                  />
                  {outOfStock && (
                    <div className="absolute inset-0 bg-red-600/80 backdrop-blur-sm flex items-center justify-center rounded-[2rem] animate-pulse">
                      <span className="text-white text-[10px] font-black tracking-widest uppercase">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3
                        className={`font-black text-xl tracking-tight leading-tight ${outOfStock ? "text-gray-400" : "text-gray-800"}`}
                      >
                        {item.name}
                      </h3>
                      <button
                        onClick={() =>
                          removeFromCart(
                            item._id,
                            item.selectedSize,
                            item.selectedColor,
                          )
                        }
                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-500 uppercase">
                        Size {item.selectedSize}
                      </span>
                      <span className="text-[10px] font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-500 uppercase">
                        {item.selectedColor}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <span
                      className={`text-2xl font-black ${outOfStock ? "text-gray-300" : "text-emerald-600"}`}
                    >
                      {new Intl.NumberFormat("vi-VN").format(item.price)}
                      <span className="text-sm ml-0.5">đ</span>
                    </span>

                    {!outOfStock ? (
                      <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-100 p-1.5 shadow-inner">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item._id,
                              item.selectedSize,
                              item.selectedColor,
                              -1,
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm hover:text-emerald-500 active:scale-90 transition font-bold"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-black text-gray-700">
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
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm hover:text-emerald-500 active:scale-90 transition font-bold"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <p className="text-red-500 text-[11px] font-black italic animate-pulse">
                        Sản phẩm hiện không khả dụng
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SUMMARY CARD */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 p-10 rounded-[3rem] text-white shadow-2xl sticky top-28 overflow-hidden group">
            {/* Hiệu ứng tia sáng nền */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/40 transition-all duration-700"></div>

            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              Thanh toán{" "}
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            </h2>

            <div className="space-y-6">
              <div className="flex justify-between items-center text-gray-400 font-bold">
                <span>Số lượng sản phẩm:</span>
                <span className="text-white">{selectedItems.length} món</span>
              </div>
              <div className="flex justify-between items-center text-gray-400 font-bold">
                <span>Phí vận chuyển:</span>
                <span className="text-emerald-400">Miễn phí</span>
              </div>

              <div className="pt-8 mt-4 border-t border-white/10 flex flex-col gap-2">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  Tổng tiền phải trả
                </span>
                <span className="text-4xl font-black text-emerald-400 tracking-tighter">
                  {new Intl.NumberFormat("vi-VN").format(calculateTotal())}đ
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-emerald-500 text-white py-5 mt-6 rounded-[2rem] font-black hover:bg-emerald-400 transition-all shadow-xl hover:shadow-emerald-500/20 active:scale-95 uppercase tracking-widest text-sm"
              >
                Xác nhận đặt hàng
              </button>

              <p className="text-[10px] text-center text-gray-500 font-medium px-4">
                Bằng cách nhấn xác nhận, bạn đã đồng ý với các điều khoản mua
                hàng của EcoFashion.
              </p>
            </div>
          </div>

          <Link
            to="/products"
            className="flex items-center justify-center gap-2 mt-8 text-sm font-bold text-gray-400 hover:text-emerald-600 transition"
          >
            ← Tiếp tục chọn thêm đồ
          </Link>
        </div>
      </div>
    </div>
  );
}
