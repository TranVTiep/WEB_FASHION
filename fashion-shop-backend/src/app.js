import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/categories", categoryRoutes); // Category management routes
app.use("/api/products", productRoutes); // Product management routes
app.use("/api/cart", cartRoutes); // Cart management routes
app.use("/api/orders", orderRoutes); // Order management routes
app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
  res.send("API running...");
});

export default app;
