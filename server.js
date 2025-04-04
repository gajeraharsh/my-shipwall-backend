const dotenv = require("dotenv");
dotenv.config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.get("/api/test", (req, res) => {
  res.json({
    message: "Hello World",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

// Only listen to port if running directly (not in Vercel)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export app for Vercel serverless deployment
module.exports = app;
