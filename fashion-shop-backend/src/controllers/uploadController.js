import xlsx from "xlsx";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

export const importProductsFromExcel = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Vui lòng chọn file Excel!" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const productsToInsert = [];
    const categories = await Category.find();

    const getValue = (obj, keys) => {
      for (const key of keys) {
        const foundKey = Object.keys(obj).find(
          (k) => k.trim().toLowerCase() === key.toLowerCase(),
        );
        if (foundKey) return obj[foundKey];
      }
      return undefined;
    };

    for (const item of data) {
      const name = getValue(item, ["Tên sản phẩm", "Name", "Ten san pham"]);
      const price = getValue(item, ["Giá", "Price", "Gia"]);
      const categoryName = getValue(item, ["Danh mục", "Category", "Danh muc"]);
      const image = getValue(item, ["Hình ảnh", "Image", "Hinh anh"]);
      const description = getValue(item, ["Mô tả", "Description", "Mo ta"]);

      // 👇 Lấy số lượng, map vào biến stockVal
      const stockVal = getValue(item, [
        "Tồn kho",
        "Stock",
        "So luong",
        "Quantity",
      ]);

      const matchedCategory = categories.find(
        (c) =>
          c.name.toLowerCase() ===
          categoryName?.toString().trim().toLowerCase(),
      );
      const categoryId = matchedCategory
        ? matchedCategory._id
        : categories[0]?._id;

      if (name && price) {
        productsToInsert.push({
          name,
          price: Number(price),
          image: image || "",
          description: description || "",
          category: categoryId,
          // 👇 CHỈ LƯU VÀO stock
          stock: Number(stockVal) || 0,
          rating: 0,
          numReviews: 0,
        });
      }
    }

    if (productsToInsert.length > 0) {
      await Product.insertMany(productsToInsert);
      res
        .status(201)
        .json({ message: `Đã nhập ${productsToInsert.length} sản phẩm!` });
    } else {
      res.status(400).json({ message: "File lỗi hoặc rỗng!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi Import: " + error.message });
  }
};
