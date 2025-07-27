const app = require("./app");
const db = require("./db/db");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await db(); // connect to MongoDB
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
};

startServer();
