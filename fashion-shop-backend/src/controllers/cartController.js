import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );
  res.json(cart || { items: [] });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Sản phẩm không tồn tại");
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity }],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
  }
  await cart.save();
  res.json(cart);
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Giỏ hàng trống");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== id && item._id.toString() !== id,
  );
  await cart.save();
  res.json(cart);
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Giỏ hàng không tồn tại");
  }

  const itemIndex = cart.items.findIndex(
    (p) => p.product.toString() === productId,
  );
  if (itemIndex > -1) {
    if (quantity > 0) {
      cart.items[itemIndex].quantity = quantity;
    } else {
      cart.items.splice(itemIndex, 1);
    }
  } else {
    res.status(404);
    throw new Error("Sản phẩm không có trong giỏ");
  }

  await cart.save();
  const updatedCart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );
  res.json(updatedCart);
});
