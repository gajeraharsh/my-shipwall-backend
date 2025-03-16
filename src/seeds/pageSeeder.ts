import mongoose from "mongoose";
import { PageModel } from '../models/Role'
// Connect to MongoDB
const connection = mongoose.connect('mongodb+srv://shipwall:shipwall@cluster0.sy4tt.mongodb.net');
// Define default pages
const pages = [
    { pageGroup: "Dashboard", pageName: "Home", pageLink: "/dashboard" },
    { pageGroup: "Users", pageName: "User Management", pageLink: "/users" },
    { pageGroup: "Roles", pageName: "Role Management", pageLink: "/roles" },
    { pageGroup: "Products", pageName: "Product List", pageLink: "/products" },
    { pageGroup: "Orders", pageName: "Order Management", pageLink: "/orders" },
    { pageGroup: "Settings", pageName: "General Settings", pageLink: "/settings" },
    { pageGroup: "Settings", pageName: "Payment Settings", pageLink: "/settings/payment" },
    { pageGroup: "Reports", pageName: "Sales     Report", pageLink: "/reports/sales" },
    { pageGroup: "Reports", pageName: "Customer Report", pageLink: "/reports/customers" },
    { pageGroup: "Marketing", pageName: "Promotions", pageLink: "/marketing/promotions" },
];

// Insert pages into the database
const seedPages = async () => {
    try {
        await PageModel.deleteMany(); // Clear existing records
        await PageModel.insertMany(pages); // Insert default records
        console.log("✅ Default pages inserted successfully!");
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error inserting pages:", error);
        mongoose.connection.close();
    }
};

// Run the function
seedPages();
