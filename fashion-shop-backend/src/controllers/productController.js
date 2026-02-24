import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";

export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
    : {};
  const categoryFilter = req.query.category
    ? { category: req.query.category }
    : {};

  const count = await Product.countDocuments({ ...keyword, ...categoryFilter });
  const products = await Product.find({ ...keyword, ...categoryFilter })
    .populate("category")
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category")
    .populate("reviews.user", "name email");
  if (!product) {
    res.status(404);
    throw new Error("Không tìm thấy sản phẩm");
  }
  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const { stock, countInStock, ...rest } = req.body;
  const finalStock = Number(stock) || Number(countInStock) || 0;
  const product = await Product.create({ ...rest, stock: finalStock });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, category, stock, countInStock } =
    req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Không tìm thấy sản phẩm");
  }

  product.name = name || product.name;
  product.price = price || product.price;
  product.description = description || product.description;
  product.image = image || product.image;
  product.category = category || product.category;

  if (stock !== undefined) product.stock = Number(stock);
  else if (countInStock !== undefined) product.stock = Number(countInStock);

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Không tìm thấy sản phẩm");
  }
  res.json({ message: "Đã xóa sản phẩm" });
});

export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Không tìm thấy sản phẩm");
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString(),
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("Bạn đã đánh giá rồi!");
  }

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
});

export const fixStockData = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  let count = 0;
  for (const p of products) {
    const rawData = p.toObject();
    if (p.stock === 0 && rawData.countInStock > 0) {
      p.stock = rawData.countInStock;
      await p.save();
      count++;
    }
  }
  res.json({ message: `Đã khôi phục kho cho ${count} sản phẩm!` });
});
