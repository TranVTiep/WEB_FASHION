import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { getStatusBadge } from "../../utils/statusHelper";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  // --- STATE MODAL ---
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Kiểm tra quyền
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Bạn không có quyền truy cập!");
      navigate("/");
    }
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      // Xử lý dữ liệu trả về
      if (res.data.orders) {
        setOrders(res.data.orders);
      } else if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      toast.error("Lỗi tải đơn hàng");
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchOrders();
    }
  }, [user]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/orders/${id}`, { status: newStatus });
      toast.success(`Đã cập nhật: ${newStatus} ✅`);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const openModal = (order) => {
    console.log("Order Data:", order); // Kiểm tra xem có trường 'items' không
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 relative">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-l-4 border-red-600 pl-4 uppercase">
        Quản lý Đơn hàng
      </h1>

      <div className="overflow-x-auto shadow-lg rounded-lg bg-white border border-gray-200">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-white uppercase bg-gray-900">
            <tr>
              <th className="px-6 py-4">Mã đơn</th>
              <th className="px-6 py-4">Khách hàng</th>
              <th className="px-6 py-4">Tổng tiền</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-center">Chi tiết</th>
              <th className="px-6 py-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => {
                const statusInfo = getStatusBadge(order.status);

                return (
                  <tr
                    key={order._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-mono text-blue-600 font-bold">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">
                        {order.user?.name || "Khách lẻ"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-red-600 font-bold">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(order.totalPrice)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit border ${statusInfo.color}`}
                      >
                        <span>{statusInfo.icon}</span> {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openModal(order)}
                        className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
                      >
                        👁️ Xem
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="border border-gray-300 p-1 rounded bg-white text-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order._id, e.target.value)
                        }
                      >
                        <option value="pending">⏳ Chờ xử lý</option>
                        <option value="confirmed">✅ Đã xác nhận</option>
                        <option value="shipping">🚚 Đang giao</option>
                        <option value="completed">🎉 Hoàn thành</option>
                        <option value="cancelled">❌ Hủy đơn</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL CHI TIẾT (ĐÃ SỬA items) ================= */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Chi tiết đơn hàng
                </h2>
                <p className="text-sm text-blue-600 font-mono font-bold">
                  #{selectedOrder._id.toUpperCase()}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cột Trái: Thông tin nhận hàng */}
              <div>
                <h3 className="text-sm font-bold uppercase text-gray-500 mb-3 border-b pb-1">
                  Thông tin nhận hàng
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">Người nhận:</span>{" "}
                    {selectedOrder.user?.name || "Khách vãng lai"}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    {selectedOrder.user?.email}
                  </p>
                  <p>
                    <span className="font-semibold">SĐT:</span>{" "}
                    {selectedOrder.shippingAddress?.phone || "N/A"}
                  </p>
                  <div className="bg-gray-100 p-3 rounded text-xs border">
                    <span className="font-bold block mb-1">Địa chỉ:</span>
                    {selectedOrder.shippingAddress?.address}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Ngày đặt:{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              {/* Cột Phải: Sản phẩm */}
              <div>
                {/* 👇 ĐÃ SỬA: Dùng selectedOrder.items thay vì orderItems */}
                <h3 className="text-sm font-bold uppercase text-gray-500 mb-3 border-b pb-1">
                  Sản phẩm ({selectedOrder.items?.length || 0})
                </h3>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {/* 👇 ĐÃ SỬA: Dùng selectedOrder.items */}
                  {selectedOrder.items?.map((item, index) => {
                    // Logic hiển thị ảnh (tìm ảnh ở cả 2 nơi cho chắc)
                    const productImage =
                      item.product?.image ||
                      item.image ||
                      "https://via.placeholder.com/150";
                    const productName =
                      item.product?.name || item.name || "Sản phẩm không tên";
                    const productPrice = item.price || 0; // Giá lưu trong order item thường là giá tại thời điểm mua

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 border-b pb-2 last:border-0"
                      >
                        <img
                          src={productImage}
                          alt={productName}
                          className="w-14 h-14 object-cover rounded border bg-gray-100"
                          onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/150")
                          }
                        />
                        <div className="flex-1">
                          <p
                            className="text-sm font-bold text-gray-800 line-clamp-2"
                            title={productName}
                          >
                            {productName}
                          </p>
                          <p className="text-xs text-gray-500">
                            SL:{" "}
                            <span className="font-bold text-black">
                              {item.quantity}
                            </span>{" "}
                            x{" "}
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(productPrice)}
                          </p>
                        </div>
                        <div className="text-sm font-bold text-gray-800">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(productPrice * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t flex justify-between items-center text-lg font-bold bg-gray-50 p-2 rounded">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600 text-xl">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(selectedOrder.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-bold text-gray-700 transition"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  updateStatus(selectedOrder._id, "shipping");
                  closeModal();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold text-white shadow transition flex items-center gap-2"
              >
                🚚 Giao hàng ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
