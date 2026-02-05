// File: src/utils/generateToken.js
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token sống 30 ngày
  });
};

export default generateToken;
