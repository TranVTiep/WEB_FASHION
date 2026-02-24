import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/my-orders");
      setOrders(
        res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      );
    } catch (err) {
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không? 🌿")) {
      try {
        await api.put(`/orders/${orderId}/cancel`);
        toast.success("Đã hủy đơn hàng và hoàn kho!");
        fetchOrders();
      } catch (err) {
        toast.error(err.response?.data?.message || "Lỗi khi hủy đơn");
      }
    }
  };

  // Hàm helper để render Badge trạng thái chính xác
  const renderStatus = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-5 py-1.5 rounded-xl text-[11px] font-black tracking-wider bg-yellow-50 text-yellow-600 border border-yellow-100">
            ĐANG XỬ LÝ
          </span>
        );
      case "confirmed":
        return (
          <span className="px-5 py-1.5 rounded-xl text-[11px] font-black tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
            ĐÃ XÁC NHẬN
          </span>
        );
      case "shipping":
        return (
          <span className="px-5 py-1.5 rounded-xl text-[11px] font-black tracking-wider bg-purple-50 text-purple-600 border border-purple-100">
            ĐANG GIAO HÀNG
          </span>
        );
      case "delivered":
      case "completed":
        return (
          <span className="px-5 py-1.5 rounded-xl text-[11px] font-black tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
            THÀNH CÔNG
          </span>
        );
      case "cancelled":
        return (
          <span className="px-5 py-1.5 rounded-xl text-[11px] font-black tracking-wider bg-red-50 text-red-500 border border-red-100">
            ĐÃ HỦY
          </span>
        );
      default:
        return (
          <span className="px-5 py-1.5 rounded-xl text-[11px] font-black tracking-wider bg-gray-50 text-gray-500 border border-gray-100">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-emerald-600 font-medium tracking-widest animate-pulse">
        ĐANG TẢI ĐƠN HÀNG...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3">
          📦 Đơn mua của tôi
        </h1>

        {orders.length === 0 ? (
          <div className="text-center bg-white p-16 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="text-6xl mb-6 text-gray-200">🛒</div>
            <p className="text-gray-500 mb-8 text-lg font-medium">
              Bạn chưa có đơn hàng nào trong lịch sử.
            </p>
            <Link
              to="/products"
              className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
              >
                {/* Header đơn hàng */}
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4 border-b border-gray-50 pb-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-mono tracking-widest">
                      MÃ ĐƠN: #{order._id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                      Ngày đặt:{" "}
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  {/* Sử dụng hàm renderStatus đã sửa lỗi */}
                  {renderStatus(order.status)}
                </div>

                {/* Danh sách sản phẩm */}
                <div className="space-y-5 mb-8">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-5 group">
                      <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                        <img
                          src={
                            item.product?.image ||
                            "https://via.placeholder.com/150"
                          }
                          alt={item.product?.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 truncate text-base group-hover:text-emerald-600 transition-colors">
                          {item.product?.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 font-medium">
                          <span>
                            Size: {item.selectedSize || item.size || "Free"}
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>
                            Màu: {item.selectedColor || item.color || "Basic"}
                          </span>
                        </div>
                        <p className="text-emerald-600 font-bold mt-1">
                          x{item.quantity}
                          <span className="text-gray-300 font-normal mx-2">
                            |
                          </span>
                          {new Intl.NumberFormat("vi-VN").format(item.price)}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer đơn hàng */}
                <div className="flex flex-wrap justify-between items-end pt-6 border-t border-gray-50 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">
                      Tổng thanh toán
                    </p>
                    <p className="text-2xl font-black text-emerald-600 tracking-tight">
                      {new Intl.NumberFormat("vi-VN").format(order.totalPrice)}đ
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to={`/products/${order.items[0]?.product?._id || ""}`}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
                    >
                      Mua lại
                    </Link>

                    {/* Chỉ cho phép Hủy khi đang ở trạng thái Pending */}
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleCancel(order._id)}
                        className="bg-white text-red-500 border-2 border-red-50 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm active:scale-95"
                      >
                        Hủy đơn hàng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
