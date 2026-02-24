import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(
  (config) => {
    try {
      // 1. Lấy chuỗi dữ liệu từ LocalStorage
      const userStr = localStorage.getItem("user");

      if (userStr && userStr !== "undefined") {
        // 2. Chuyển thành Object một cách an toàn
        const user = JSON.parse(userStr);

        // 3. Set token vào header
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (error) {
      console.error("Lỗi khi parse dữ liệu user từ LocalStorage:", error);
      // Optional: Xóa dữ liệu lỗi để tránh lặp lại
      // localStorage.removeItem("user");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
