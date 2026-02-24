import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      // Sắp xếp đơn mới nhất lên đầu
      setOrders(
        res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      );
    } catch (error) {
      toast.error("Lỗi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    const statusNames = {
      confirmed: "Xác nhận đơn hàng",
      shipping: "Đang giao hàng",
      delivered: "Đã giao thành công",
      cancelled: "Hủy đơn hàng",
    };

    if (
      !window.confirm(
        `Xác nhận chuyển sang trạng thái: ${statusNames[newStatus]}?`,
      )
    )
      return;

    try {
      if (newStatus === "cancelled") {
        // Gọi API Hủy để hoàn lại Kho
        await api.put(`/orders/${orderId}/cancel`);
      } else {
        // Cập nhật trạng thái tiến trình
        try {
          await api.put(`/orders/${orderId}/status`, { status: newStatus });
        } catch (err) {
          if (err.response?.status === 404) {
            await api.put(`/orders/${orderId}`, { status: newStatus });
          } else throw err;
        }
      }

      toast.success("Cập nhật trạng thái thành công! 🌿");
      fetchOrders();
      setSelectedOrder(null); // Đóng modal sau khi update
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("vi-VN");

  // Hàm render Badge Trạng thái đẹp mắt cho Bảng
  const renderStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    if (s === "pending")
      return (
        <span className="bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-yellow-100">
          ⏳ Chờ xử lý
        </span>
      );
    if (s === "confirmed")
      return (
        <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100">
          📋 Đã xác nhận
        </span>
      );
    if (s === "shipping")
      return (
        <span className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-purple-100">
          🚚 Đang giao
        </span>
      );
    if (s === "delivered" || s === "completed")
      return (
        <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100">
          ✅ Đã giao
        </span>
      );
    if (s === "cancelled")
      return (
        <span className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-100">
          ❌ Đã hủy
        </span>
      );
    return (
      <span className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-100">
        {status}
      </span>
    );
  };

  if (loading)
    return (
      <div className="p-20 text-center text-emerald-500 font-medium">
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Quản Lý Đơn Hàng
      </h1>

      {/* BẢNG ĐƠN HÀNG */}
      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="p-5 border-b border-gray-100">Mã đơn</th>
                <th className="p-5 border-b border-gray-100">Khách hàng</th>
                <th className="p-5 border-b border-gray-100">Tổng tiền</th>
                <th className="p-5 border-b border-gray-100">Trạng thái</th>
                <th className="p-5 border-b border-gray-100 text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50/50 border-b border-gray-50 last:border-0 transition"
                >
                  <td className="p-5 font-mono text-gray-500 font-medium">
                    #{order._id.substring(0, 8)}
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-gray-800">
                      {order.user?.name || "Khách vãng lai"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </td>
                  <td className="p-5 font-bold text-emerald-600">
                    {formatMoney(order.totalPrice)}
                  </td>
                  <td className="p-5">{renderStatusBadge(order.status)}</td>
                  <td className="p-5 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold hover:border-emerald-500 hover:text-emerald-500 transition shadow-sm"
                    >
                      Xem & Xử Lý
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            Chưa có đơn hàng nào.
          </div>
        )}
      </div>

      {/* MODAL CHI TIẾT (POPUP) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <h2 className="text-xl font-bold text-gray-800">
                Chi tiết đơn{" "}
                <span className="font-mono text-emerald-600">
                  #{selectedOrder._id.substring(0, 8)}
                </span>
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full flex items-center justify-center font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Cột Trái: SP */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4 bg-gray-50 p-3 rounded-xl">
                  📦 Sản phẩm
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 border-b border-gray-50 pb-4 last:border-0"
                    >
                      <img
                        src={
                          item.product?.image ||
                          "https://via.placeholder.com/80"
                        }
                        className="w-16 h-16 object-cover rounded-xl bg-gray-50 border border-gray-100"
                        alt=""
                      />
                      <div className="flex-1">
                        <p className="font-bold text-sm text-gray-800 line-clamp-1">
                          {item.product?.name || "Sản phẩm đã xóa"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 uppercase">
                          Size: {item.size} | Màu: {item.color}
                        </p>
                        <div className="flex justify-between mt-2 text-sm">
                          <span className="font-medium text-gray-500">
                            x{item.quantity}
                          </span>
                          <span className="font-bold text-gray-800">
                            {formatMoney(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100 text-lg">
                  <span className="font-bold text-gray-600">Tổng cộng:</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {formatMoney(selectedOrder.totalPrice)}
                  </span>
                </div>
              </div>

              {/* Cột Phải: KH & Hành động (STATE MACHINE) */}
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 bg-gray-50 p-3 rounded-xl">
                    👤 Khách hàng
                  </h3>
                  <div className="bg-white border border-gray-100 p-5 rounded-2xl text-sm space-y-3 text-gray-600 shadow-sm">
                    <p>
                      <span className="font-bold text-gray-800">Tên:</span>{" "}
                      {selectedOrder.user?.name || "Khách lẻ"}
                    </p>
                    <p>
                      <span className="font-bold text-gray-800">Email:</span>{" "}
                      {selectedOrder.user?.email || "N/A"}
                    </p>
                    <p>
                      <span className="font-bold text-gray-800">SĐT:</span>{" "}
                      {selectedOrder.shippingAddress?.phone}
                    </p>
                    <p>
                      <span className="font-bold text-gray-800">Địa chỉ:</span>{" "}
                      {selectedOrder.shippingAddress?.address}
                    </p>
                    <p>
                      <span className="font-bold text-gray-800">Ngày đặt:</span>{" "}
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-4 bg-gray-50 p-3 rounded-xl flex justify-between items-center">
                    ⚡ Xử lý đơn
                    {renderStatusBadge(selectedOrder.status)}
                  </h3>

                  {/* LOGIC CHUYỂN TRẠNG THÁI */}
                  {selectedOrder.status !== "cancelled" &&
                    selectedOrder.status !== "delivered" &&
                    selectedOrder.status !== "completed" && (
                      <div className="flex flex-col gap-3">
                        {selectedOrder.status === "pending" && (
                          <button
                            onClick={() =>
                              updateStatus(selectedOrder._id, "confirmed")
                            }
                            className="w-full bg-blue-500 text-white py-3.5 rounded-xl font-bold hover:bg-blue-600 shadow-md transition"
                          >
                            📋 XÁC NHẬN ĐƠN HÀNG
                          </button>
                        )}

                        {selectedOrder.status === "confirmed" && (
                          <button
                            onClick={() =>
                              updateStatus(selectedOrder._id, "shipping")
                            }
                            className="w-full bg-purple-500 text-white py-3.5 rounded-xl font-bold hover:bg-purple-600 shadow-md transition"
                          >
                            🚚 TIẾN HÀNH GIAO HÀNG
                          </button>
                        )}

                        {selectedOrder.status === "shipping" && (
                          <button
                            onClick={() =>
                              updateStatus(selectedOrder._id, "delivered")
                            }
                            className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 shadow-md transition"
                          >
                            ✅ ĐÃ GIAO THÀNH CÔNG
                          </button>
                        )}

                        {/* Nút hủy nằm dưới cùng để hoàn kho */}
                        <button
                          onClick={() =>
                            updateStatus(selectedOrder._id, "cancelled")
                          }
                          className="w-full bg-white border-2 border-red-100 text-red-500 py-3 rounded-xl font-bold hover:bg-red-50 transition mt-2"
                        >
                          🚫 HỦY ĐƠN VÀ HOÀN KHO
                        </button>
                      </div>
                    )}

                  {(selectedOrder.status === "delivered" ||
                    selectedOrder.status === "completed") && (
                    <div className="bg-emerald-50 text-emerald-600 p-5 rounded-2xl text-center font-bold border border-emerald-100">
                      Đơn hàng đã hoàn tất ✅
                    </div>
                  )}

                  {selectedOrder.status === "cancelled" && (
                    <div className="bg-red-50 text-red-500 p-5 rounded-2xl text-center font-bold border border-red-100">
                      Đơn hàng đã bị hủy ❌
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
