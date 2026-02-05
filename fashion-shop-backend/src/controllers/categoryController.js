import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body;

    const category = await Category.create({ name, parentId });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, parentId },
      { new: true },
    );

    if (!category)
      return res.status(404).json({ message: "Category không tồn tại" });

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category)
      return res.status(404).json({ message: "Category không tồn tại" });

    res.json({ message: "Đã xóa category" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
