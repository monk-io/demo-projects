const express = require("express");
const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

app.get("/api", (req, res) => {
  res.json({ message: "Hello from the backend" });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
