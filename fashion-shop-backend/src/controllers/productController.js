import Product from "../models/Product.js";

// CREATE
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL (Đã nâng cấp: Hỗ trợ Tìm kiếm & Lọc)
export const getProducts = async (req, res) => {
  try {
    // 1. Lấy tham số từ URL (VD: ?keyword=ao&category=abc...)
    const { keyword, category } = req.query;

    // 2. Tạo bộ lọc rỗng ban đầu
    let query = {};

    // 3. Nếu có từ khóa -> Thêm điều kiện tìm tên (Regex: tìm gần đúng, không phân biệt hoa thường)
    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }

    // 4. Nếu có danh mục -> Thêm điều kiện lọc danh mục
    if (category) {
      query.category = category;
    }

    // 5. Truy vấn Database với bộ lọc trên
    const products = await Product.find(query)
      .populate("category")
      .sort({ createdAt: -1 }); // Sắp xếp sản phẩm mới nhất lên đầu

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ONE
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
