import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

// 1. HÀM ĐĂNG KÝ (Đã được tối ưu validate và trả về token)
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Kiểm tra user đã tồn tại chưa
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res
        .status(400)
        .json({ message: "Email đã tồn tại trong hệ thống" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Trả về kết quả kèm Token
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Dữ liệu người dùng không hợp lệ" });
    }
  } catch (error) {
    console.error("Lỗi quá trình đăng ký:", error.message);
    res.status(500).json({ message: "Lỗi Server Nội Bộ" });
  }
};

// 2. HÀM ĐĂNG NHẬP (Giữ nguyên logic của bạn)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Chặn đăng nhập nếu bị khóa
      if (user.status === "blocked") {
        return res
          .status(403)
          .json({ message: "Tài khoản của bạn đã bị khóa" });
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. HÀM QUÊN MẬT KHẨU (Giữ nguyên logic của bạn)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });
    const tempPassword = crypto.randomBytes(4).toString("hex");
    user.password = await bcrypt.hash(tempPassword, 10);
    await user.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Sử dụng biến môi trường
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: '"Shop Fashion" <no-reply@shop.com>',
      to: email,
      subject: "Cấp lại mật khẩu mới",
      text: `Mật khẩu tạm thời của bạn là: ${tempPassword}`,
    });
    res.json({ message: "Mật khẩu mới đã được gửi vào Email!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi gửi mail: " + error.message });
  }
};
