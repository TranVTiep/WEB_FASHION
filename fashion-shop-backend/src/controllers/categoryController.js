import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";

export const createCategory = asyncHandler(async (req, res) => {
  const { name, parentId } = req.body;
  const category = await Category.create({ name, parentId });
  res.status(201).json(category);
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, parentId } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, parentId },
    { new: true },
  );
  if (!category) {
    res.status(404);
    throw new Error("Category không tồn tại");
  }
  res.json(category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category không tồn tại");
  }
  res.json({ message: "Đã xóa category" });
});
