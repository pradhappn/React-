require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

const createDemoUser = async () => {
  const demoEmail = "demouser@gmail.com";
  const demoPassword = "demouser";

  try {
    const existingUser = await User.findOne({ email: demoEmail });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(demoPassword, 10);
      await User.create({
        name: "Demo User",
        email: demoEmail,
        password: hashedPassword,
      });
      console.log("Demo user created:", demoEmail);
    } else {
      console.log("Demo user already exists:", demoEmail);
    }
  } catch (err) {
    console.error("Failed to create demo user:", err.message);
  }
};

const PORT = process.env.PORT || 5000;

connectDB()
  .then(createDemoUser)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Server startup failed:", err.message);
    process.exit(1);
  });