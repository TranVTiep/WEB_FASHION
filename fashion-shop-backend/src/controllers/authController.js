import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Vui lòng nhập đầy đủ thông tin");
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("Email đã tồn tại trong hệ thống");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Dữ liệu người dùng không hợp lệ");
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    if (user.status === "blocked") {
      res.status(403);
      throw new Error("Tài khoản của bạn đã bị khóa");
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Sai email hoặc mật khẩu");
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("Email không tồn tại");
  }

  const tempPassword = crypto.randomBytes(4).toString("hex");
  user.password = await bcrypt.hash(tempPassword, 10);
  await user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: '"Shop Fashion" <no-reply@shop.com>',
    to: email,
    subject: "Cấp lại mật khẩu mới",
    text: `Mật khẩu tạm thời của bạn là: ${tempPassword}\nVui lòng đăng nhập và đổi mật khẩu ngay.`,
  });

  res.json({ message: "Mật khẩu mới đã được gửi vào Email!" });
});
