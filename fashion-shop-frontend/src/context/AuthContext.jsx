import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios"; // 👈 Dùng instance api đã cấu hình (thay vì axios thường)

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Khởi tạo State an toàn (Tránh lỗi sập trang "undefined")
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser && savedUser !== "undefined") {
        return JSON.parse(savedUser);
      }
      return null;
    } catch (error) {
      localStorage.removeItem("user"); // Xóa rác nếu lỗi
      return null;
    }
  });

  // 2. Tự động đồng bộ User vào LocalStorage mỗi khi thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // 3. Hàm Đăng Nhập
  const login = async (email, password) => {
    // Gọi API qua instance 'api' (đã có baseURL)
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    // Backend trả về object phẳng: { _id, name, token, ... }
    // Ta lưu nguyên cục này vào state user
    const userData = res.data;
    setUser(userData);

    // Lưu ý: useEffect ở trên sẽ tự động lưu vào LocalStorage, không cần setItem thủ công ở đây
  };

  // 4. Hàm Đăng Ký
  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    const userData = res.data;
    setUser(userData);
  };

  // 5. Hàm Đăng Xuất
  const logout = () => {
    setUser(null);
    // useEffect sẽ tự động xóa LocalStorage
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
