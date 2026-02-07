import Product from "../models/Product.js";

// CREATE (Giữ nguyên)
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL (Đã nâng cấp: Tìm kiếm + Lọc + PHÂN TRANG)
export const getProducts = async (req, res) => {
  try {
    // 1. Cấu hình phân trang
    const pageSize = 8; // Số lượng sản phẩm trên 1 trang (bạn có thể đổi số này)
    const page = Number(req.query.pageNumber) || 1; // Trang hiện tại (mặc định là 1)

    // 2. Lấy tham số tìm kiếm & lọc từ URL
    const { keyword, category } = req.query;

    // 3. Tạo bộ lọc (Query Object)
    let query = {};

    // Nếu có từ khóa -> Thêm điều kiện tìm tên
    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }

    // Nếu có danh mục -> Thêm điều kiện lọc danh mục
    if (category) {
      query.category = category;
    }

    // 4. QUAN TRỌNG: Đếm tổng số sản phẩm khớp điều kiện (để tính tổng số trang)
    const count = await Product.countDocuments(query);

    // 5. Truy vấn Database với phân trang
    const products = await Product.find(query)
      .populate("category") // Lấy chi tiết category
      .limit(pageSize) // Giới hạn số lượng lấy ra
      .skip(pageSize * (page - 1)) // Bỏ qua các sản phẩm của trang trước
      .sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu

    // 6. Trả về kết quả kèm thông tin phân trang
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize), // Tổng số trang = Tổng sp / Kích thước trang
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ONE (Giữ nguyên)
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

// UPDATE (Giữ nguyên)
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

// DELETE (Giữ nguyên)
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
