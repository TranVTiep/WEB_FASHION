import asyncHandler from "express-async-handler";
import xlsx from "xlsx";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

export const importProductsFromExcel = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Vui lòng chọn file Excel!");
  }
  const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
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
    const name = getValue(item, ["Tên sản phẩm", "Name"]);
    const price = getValue(item, ["Giá", "Price"]);
    const categoryName = getValue(item, ["Danh mục", "Category"]);
    const stockVal = getValue(item, ["Tồn kho", "Stock", "Quantity"]);
    const sizeRaw = getValue(item, ["Size", "Kich co"]);
    const colorRaw = getValue(item, ["Màu", "Color"]);

    const sizes = sizeRaw
      ? sizeRaw
          .toString()
          .split(",")
          .map((s) => s.trim())
      : [];
    const colors = colorRaw
      ? colorRaw
          .toString()
          .split(",")
          .map((c) => c.trim())
      : [];
    const matchedCategory = categories.find(
      (c) =>
        c.name.toLowerCase() === categoryName?.toString().trim().toLowerCase(),
    );

    if (name && price) {
      productsToInsert.push({
        name,
        price: Number(price),
        image: getValue(item, ["Hình ảnh", "Image"]) || "",
        description: getValue(item, ["Mô tả", "Description"]) || "",
        category: matchedCategory ? matchedCategory._id : categories[0]?._id,
        stock: Number(stockVal) || 0,
        sizes,
        colors,
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
    res.status(400);
    throw new Error("File lỗi hoặc rỗng!");
  }
});
