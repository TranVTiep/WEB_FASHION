import multer from "multer";

// Cấu hình lưu trữ: Lưu vào bộ nhớ tạm (RAM) để xử lý nhanh, không lưu rác vào ổ cứng
const storage = multer.memoryStorage();

// Bộ lọc file: Chỉ chấp nhận file Excel
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml") ||
    file.originalname.match(/\.(xlsx|xls)$/)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file Excel (.xlsx, .xls)!"), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});
