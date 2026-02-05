import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/my-orders");
      const sortedOrders = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setOrders(sortedOrders);
    } catch (err) {
      console.error("Lỗi load đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?"))
      return;

    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast.success("Đã hủy đơn hàng thành công ✅");
      fetchOrders();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể hủy đơn hàng này ❌",
      );
    }
  };

  // 👇 FIX 1: Thêm "complete" vào danh sách màu xanh
  const getStatusColor = (status) => {
    const s = String(status).toLowerCase();

    if (s.includes("pending") || s.includes("chờ"))
      return "text-yellow-600 bg-yellow-100";
    if (s.includes("confirm") || s.includes("xác nhận"))
      return "text-blue-600 bg-blue-100";
    if (
      s.includes("shipping") ||
      s.includes("giao") ||
      s.includes("vận chuyển")
    )
      return "text-purple-600 bg-purple-100";

    // 👇 Đã thêm "complete" vào đây
    if (
      s.includes("delivered") ||
      s.includes("hoàn thành") ||
      s.includes("xong") ||
      s.includes("success") ||
      s.includes("complete")
    )
      return "text-green-600 bg-green-100";

    if (s.includes("cancel") || s.includes("hủy") || s.includes("fail"))
      return "text-red-600 bg-red-100";

    return "text-gray-600 bg-gray-100";
  };

  // 👇 FIX 2: Thêm "complete" vào để dịch sang tiếng Việt là "Giao thành công"
  const translateStatus = (status) => {
    const s = String(status).toLowerCase();

    if (s.includes("pending") || s.includes("chờ")) return "Chờ xử lý";
    if (s.includes("shipping")) return "Đang giao hàng";

    // 👇 Đã thêm "complete" vào đây
    if (
      s.includes("delivered") ||
      s.includes("success") ||
      s.includes("hoàn thành") ||
      s.includes("complete")
    )
      return "Giao thành công";

    if (s.includes("cancel") || s.includes("hủy")) return "Đã hủy";

    return status;
  };

  const canCancel = (status) => {
    const s = String(status).toLowerCase();
    return s.includes("pending") || s.includes("chờ");
  };

  const isCancelled = (status) => {
    const s = String(status).toLowerCase();
    return s.includes("cancel") || s.includes("hủy");
  };

  if (loading)
    return <div className="text-center mt-20">Đang tải lịch sử... ⏳</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Lịch sử đơn hàng</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào.</p>
          <Link
            to="/products"
            className="bg-black text-white px-6 py-2 rounded font-bold"
          >
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border rounded-lg shadow-sm overflow-hidden"
            >
              {/* HEADER */}
              <div className="bg-gray-50 p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-bold">
                    Mã: #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="mx-2">|</span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(
                    order.status,
                  )}`}
                >
                  {translateStatus(order.status)}
                </span>
              </div>

              {/* BODY */}
              <div className="p-4">
                {order.items.map((item, idx) => {
                  const product = item.product || {
                    name: "Sản phẩm đã ngừng kinh doanh",
                    image: "",
                  };
                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-2 border-b last:border-0 border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            product.image || "https://via.placeholder.com/50"
                          }
                          className="w-16 h-16 object-cover rounded border"
                          alt=""
                        />
                        <div>
                          <p className="font-bold text-gray-800">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            x{item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* FOOTER */}
              <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                <div className="text-lg">
                  Tổng tiền:{" "}
                  <span className="font-bold text-red-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.totalPrice || order.total)}
                  </span>
                </div>

                {/* NÚT BẤM */}
                {canCancel(order.status) ? (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="bg-white border border-red-500 text-red-500 hover:bg-red-50 px-4 py-2 rounded text-sm font-bold transition"
                  >
                    Hủy đơn hàng
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-200 text-gray-400 px-4 py-2 rounded text-sm font-bold cursor-not-allowed border border-transparent"
                  >
                    {isCancelled(order.status) ? "Đã hủy" : "Không thể hủy"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
