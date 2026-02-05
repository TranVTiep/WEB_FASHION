import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(
  (config) => {
    // 1. Lấy chuỗi dữ liệu từ LocalStorage
    const userStr = localStorage.getItem("user");

    if (userStr) {
      // 2. Chuyển thành Object
      const user = JSON.parse(userStr);

      // 3. Lấy token (Vì backend sửa rồi nên token nằm ngay lớp ngoài)
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
