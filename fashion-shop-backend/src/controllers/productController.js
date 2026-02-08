import Product from "../models/Product.js";

// --- 1. LẤY DANH SÁCH SẢN PHẨM (PUBLIC) ---
export const getProducts = async (req, res) => {
  try {
    const pageSize = 8;
    const page = Number(req.query.pageNumber) || 1;

    // Tìm kiếm theo tên
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};

    // Lọc theo danh mục
    const categoryFilter = req.query.category
      ? { category: req.query.category }
      : {};

    // Đếm tổng số
    const count = await Product.countDocuments({
      ...keyword,
      ...categoryFilter,
    });

    // Lấy dữ liệu
    const products = await Product.find({ ...keyword, ...categoryFilter })
      .populate("category")
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 2. LẤY CHI TIẾT 1 SẢN PHẨM (PUBLIC) ---
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("reviews.user", "name email");

    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 3. TẠO SẢN PHẨM MỚI (ADMIN) ---
export const createProduct = async (req, res) => {
  try {
    // Lấy dữ liệu từ Client gửi lên
    const { stock, countInStock, ...rest } = req.body;

    // 👇 LOGIC QUAN TRỌNG:
    // Nếu Client gửi 'stock' thì lấy 'stock'.
    // Nếu lỡ gửi 'countInStock' (do code cũ) thì vẫn lấy nó gán vào 'stock' để không bị mất dữ liệu.
    const finalStock = Number(stock) || Number(countInStock) || 0;

    const product = await Product.create({
      ...rest,
      stock: finalStock, // Chỉ lưu vào biến stock chuẩn của Model
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 4. CẬP NHẬT SẢN PHẨM (ADMIN) ---
export const updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, stock, countInStock } =
      req.body;

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.category = category || product.category;

    // 👇 LOGIC CẬP NHẬT KHO (CHỈ DÙNG STOCK) 👇
    if (stock !== undefined) {
      product.stock = Number(stock);
    } else if (countInStock !== undefined) {
      // Fallback: Nếu FE gửi nhầm countInStock thì vẫn hứng lấy
      product.stock = Number(countInStock);
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 5. XÓA SẢN PHẨM (ADMIN) ---
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 6. GỬI ĐÁNH GIÁ (USER) ---
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString(),
      );
      if (alreadyReviewed)
        return res.status(400).json({ message: "Bạn đã đánh giá rồi!" });

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Đánh giá thành công!" });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 7. CÔNG CỤ DỌN DẸP DỮ LIỆU (ADMIN) ---
// Chức năng: Tìm những sản phẩm cũ đang lưu số lượng ở 'countInStock' và chuyển nó về 'stock'
export const fixStockData = async (req, res) => {
  try {
    const products = await Product.find({});
    let count = 0;
    for (const p of products) {
      // Lấy raw data để tìm countInStock ẩn trong DB (dù model không khai báo)
      const rawData = p.toObject();

      // Nếu stock đang bằng 0, mà lại tìm thấy countInStock có dữ liệu
      if (p.stock === 0 && rawData.countInStock > 0) {
        p.stock = rawData.countInStock;
        await p.save();
        count++;
      }
    }
    res.json({
      message: `Đã khôi phục dữ liệu kho vào biến 'stock' cho ${count} sản phẩm!`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
