const mongoose = require("mongoose");
require("dotenv").config(); // optional, if using .env for DB URI

// Replace with your actual connection string or use .env
const MONGODB_URI =
  "mongodb+srv://shipwall:shipwall@cluster0.sy4tt.mongodb.net";

const Order = require("../models/Order"); // Adjust path as needed

async function updateRewardStatus() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const result = await Order.updateMany({}, { rewardStatus: "given" });

    console.log(
      `${result.modifiedCount} orders updated to rewardStatus: "given"`
    );

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error updating rewardStatus:", error);
    process.exit(1);
  }
}

updateRewardStatus();
