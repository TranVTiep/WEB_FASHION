// src/utils/statusHelper.js

export const getStatusBadge = (status) => {
  switch (status) {
    case "pending":
      return {
        text: "Chờ xử lý",
        color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        icon: "⏳",
      };
    case "confirmed":
      return {
        text: "Đã xác nhận",
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: "✅",
      };
    case "shipping":
      return {
        text: "Đang giao",
        color: "bg-purple-100 text-purple-800 border border-purple-200",
        icon: "🚚",
      };
    case "completed":
      return {
        text: "Hoàn thành",
        color: "bg-green-100 text-green-800 border border-green-200",
        icon: "🎉",
      };
    case "cancelled":
      return {
        text: "Đã hủy",
        color: "bg-red-100 text-red-800 border border-red-200",
        icon: "❌",
      };
    default:
      return {
        text: "Không xác định",
        color: "bg-gray-100 text-gray-800",
        icon: "❓",
      };
  }
};
