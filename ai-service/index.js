const express = require("express");
const app = express();

app.post("/chat", (req, res) => {
  res.json({ reply: "Halo warga Bikini Bottom 🐠" });
});

app.listen(4003, () => console.log("AI Service running"));
