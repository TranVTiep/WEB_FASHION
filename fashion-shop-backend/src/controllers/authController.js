import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

// Đăng ký
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    const token = generateToken(user._id);

    // 👇 SỬA LẠI: Trả về object phẳng (Token nằm chung với thông tin)
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      token: token, // <--- Token nằm ở đây
      message: "Đăng ký thành công",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng nhập
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

    const token = generateToken(user._id);

    // 👇 SỬA LẠI: Trả về object phẳng giống hệt bên trên
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      token: token, // <--- Quan trọng
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
