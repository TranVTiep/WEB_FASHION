import xlsx from "xlsx";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

export const importProductsFromExcel = async (req, res) => {
  try {
    // 1. Kiểm tra xem có file gửi lên không
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng tải lên file Excel!" });
    }

    // 2. Đọc file Excel từ bộ nhớ (Buffer)
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; // Lấy sheet đầu tiên
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet); // Chuyển Excel -> JSON

    if (data.length === 0) {
      return res.status(400).json({ message: "File Excel rỗng!" });
    }

    // 3. Chuẩn bị dữ liệu
    const productsToInsert = [];
    const categories = await Category.find(); // Lấy tất cả danh mục để đối chiếu ID

    for (const item of data) {
      // Mapping cột Excel (Hỗ trợ cả Tiếng Việt và Tiếng Anh)
      const name = item["Tên sản phẩm"] || item.Name;
      const price = item["Giá"] || item.Price;
      const categoryName = item["Danh mục"] || item.Category;
      const stock = item["Tồn kho"] || item.Stock;
      const image = item["Hình ảnh"] || item.Image;
      const description = item["Mô tả"] || item.Description;

      // Logic: Tìm ID danh mục dựa trên tên
      const matchedCategory = categories.find(
        (c) => c.name.toLowerCase() === categoryName?.toString().toLowerCase(),
      );

      // Nếu không tìm thấy danh mục, lấy danh mục đầu tiên làm mặc định
      const categoryId = matchedCategory
        ? matchedCategory._id
        : categories[0]?._id;

      if (name && price) {
        productsToInsert.push({
          name: name,
          price: Number(price),
          image: image || "",
          description: description || "",
          category: categoryId,
          stock: Number(stock) || 0, // Lưu cả 2 trường cho chắc chắn
          countInStock: Number(stock) || 0,
          rating: 0,
          numReviews: 0,
        });
      }
    }

    // 4. Lưu hàng loạt vào MongoDB
    if (productsToInsert.length > 0) {
      await Product.insertMany(productsToInsert);
      res.status(201).json({
        message: `Nhập thành công ${productsToInsert.length} sản phẩm!`,
      });
    } else {
      res
        .status(400)
        .json({ message: "Không đọc được dữ liệu hợp lệ từ file!" });
    }
  } catch (error) {
    console.error("Lỗi Import:", error);
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};
