const mongoose = require('mongoose');
const { PageModel } = require('../models/Role'); // Adjust the path if necessary

// Connect to MongoDB
const connection = mongoose.connect('mongodb+srv://shipwall:shipwall@cluster0.sy4tt.mongodb.net');

// Define default pages
const pages = [
    { pageGroup: "Dashboard", pageName: "Dashboard", pageLink: "/Dashboard" },
    { pageGroup: "Customers", pageName: "View Customer", pageLink: "/customers" },
    { pageGroup: "Customers Pool", pageName: "Customers Pool", pageLink: "/customers-pool" },
    { pageGroup: "Sales", pageName: "View Sales Request", pageLink: "/sales/view-sales-request" },
    { pageGroup: "Sales", pageName: "Create Sales User", pageLink: "/sales/create-sales-user" },
    { pageGroup: "Sales", pageName: "View Sales Users", pageLink: "/sales/view-sales-user" },
    { pageGroup: "Admin Settings", pageName: "Page Group", pageLink: "/admin-settings/create-roles" },
    { pageGroup: "Admin Settings", pageName: "Create Admin User", pageLink: "/admin-settings/create-admin-user" },
    { pageGroup: "Admin Settings", pageName: "View Admin User", pageLink: "/admin-settings/view-admin-user" },
    { pageGroup: "App Settings", pageName: "State Master", pageLink: "/app-settings/state-master" },
    { pageGroup: "App Settings", pageName: "City Master", pageLink: "/app-settings/city-master" },
    { pageGroup: "App Settings", pageName: "Common Incentive Settings", pageLink: "/app-settings/common-inceptive-settings" },
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
