import User from "./models/User.js";
import bcrypt from "bcryptjs";

const seedAdmin = async () => {
  try {
    const adminExist = await User.findOne({ role: "admin" });

    if (!adminExist) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await User.create({
        name: "Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin",
      });

      console.log("✅ Admin created: admin@gmail.com / admin123");
    }
  } catch (error) {
    console.error("Seed admin error:", error.message);
  }
};

export default seedAdmin;
