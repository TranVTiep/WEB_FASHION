import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // State cho Modal chi tiết

  // 1. Tải danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (error) {
      toast.error("Lỗi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Cập nhật trạng thái đơn hàng (Dùng chung cho Giao hàng / Hủy / ...)
  const updateStatus = async (orderId, newStatus) => {
    if (
      !window.confirm(
        `Bạn chắc chắn muốn chuyển sang trạng thái: ${newStatus}?`,
      )
    )
      return;

    try {
      // Gọi API cập nhật (Lưu ý: Backend phải có route PUT /orders/:id hỗ trợ body { status })
      // Nếu bạn dùng route /deliver riêng thì sửa lại url nhé
      await api.put(`/orders/${orderId}/deliver`, { status: newStatus });

      toast.success("Cập nhật trạng thái thành công!");
      fetchOrders(); // Tải lại danh sách
      setSelectedOrder(null); // Tắt modal nếu đang mở
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  // Helper: Format tiền tệ
  const formatMoney = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Helper: Format ngày giờ
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-l-4 border-black pl-4">
        QUẢN LÝ ĐƠN HÀNG
      </h1>

      {/* BẢNG DANH SÁCH ĐƠN HÀNG */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-bold">
            <tr>
              <th className="p-4 border-b">Mã đơn</th>
              <th className="p-4 border-b">Khách hàng</th>
              <th className="p-4 border-b">Tổng tiền</th>
              <th className="p-4 border-b">Trạng thái</th>
              <th className="p-4 border-b text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.map((order) => (
              <tr
                key={order._id}
                className="hover:bg-gray-50 border-b last:border-0 transition"
              >
                <td className="p-4 font-mono text-blue-600 font-bold">
                  #{order._id.substring(0, 8)}
                </td>
                <td className="p-4">
                  <p className="font-bold">
                    {order.user?.name || "Khách vãng lai"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </td>
                <td className="p-4 font-bold text-red-600">
                  {formatMoney(order.totalPrice)}
                </td>
                <td className="p-4">
                  {order.status === "delivered" ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                      ✅ Đã giao
                    </span>
                  ) : order.status === "cancelled" ? (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                      ❌ Đã hủy
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                      ⏳ Chờ xử lý
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => setSelectedOrder(order)} // Bấm nút này để mở Modal
                    className="bg-black text-white px-4 py-2 rounded text-xs font-bold hover:bg-gray-800 transition"
                  >
                    Xem Chi Tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Chưa có đơn hàng nào.
          </div>
        )}
      </div>

      {/* ================= MODAL CHI TIẾT (POPUP) ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-fade-in">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold uppercase">
                Chi tiết đơn #{selectedOrder._id.substring(0, 8)}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-red-500 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cột Trái: Danh sách sản phẩm */}
              <div>
                <h3 className="font-bold text-lg mb-4 border-l-4 border-blue-500 pl-2">
                  📦 Sản phẩm
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 border-b pb-4 last:border-0"
                    >
                      <img
                        src={item.product?.image}
                        className="w-16 h-16 object-cover rounded border"
                        alt=""
                      />
                      <div className="flex-1">
                        <p className="font-bold text-sm">
                          {item.product?.name || "Sản phẩm đã xóa"}
                        </p>
                        <div className="flex gap-2 mt-1 text-xs text-gray-600">
                          {item.size && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded">
                              Màu: {item.color}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between mt-2 text-sm">
                          <span>x{item.quantity}</span>
                          <span className="font-bold">
                            {formatMoney(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600">
                    {formatMoney(selectedOrder.totalPrice)}
                  </span>
                </div>
              </div>

              {/* Cột Phải: Thông tin & Hành động */}
              <div className="space-y-6">
                {/* Thông tin khách hàng */}
                <div>
                  <h3 className="font-bold text-lg mb-4 border-l-4 border-yellow-500 pl-2">
                    👤 Khách hàng
                  </h3>
                  <div className="bg-gray-50 p-4 rounded text-sm space-y-2">
                    <p>
                      <span className="font-bold">Tên:</span>{" "}
                      {selectedOrder.user?.name}
                    </p>
                    <p>
                      <span className="font-bold">Email:</span>{" "}
                      {selectedOrder.user?.email}
                    </p>
                    <p>
                      <span className="font-bold">SĐT:</span>{" "}
                      {selectedOrder.shippingAddress?.phone}
                    </p>
                    <p>
                      <span className="font-bold">Địa chỉ:</span>{" "}
                      {selectedOrder.shippingAddress?.address}
                    </p>
                    <p>
                      <span className="font-bold">Ngày đặt:</span>{" "}
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Khu vực Admin xử lý */}
                <div>
                  <h3 className="font-bold text-lg mb-4 border-l-4 border-red-500 pl-2">
                    ⚡ Xử lý đơn hàng
                  </h3>

                  {selectedOrder.status === "pending" && (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() =>
                          updateStatus(selectedOrder._id, "delivered")
                        }
                        className="bg-black text-white py-3 rounded font-bold hover:bg-gray-800 transition"
                      >
                        ✅ XÁC NHẬN GIAO
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(selectedOrder._id, "cancelled")
                        }
                        className="bg-red-100 text-red-600 border border-red-200 py-3 rounded font-bold hover:bg-red-200 transition"
                      >
                        🚫 HỦY ĐƠN
                      </button>
                    </div>
                  )}

                  {selectedOrder.status === "delivered" && (
                    <div className="bg-green-100 text-green-800 p-4 rounded text-center font-bold border border-green-200">
                      Đơn hàng đã hoàn tất
                    </div>
                  )}

                  {selectedOrder.status === "cancelled" && (
                    <div className="bg-red-100 text-red-800 p-4 rounded text-center font-bold border border-red-200">
                      Đơn hàng đã bị hủy
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
