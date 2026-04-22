const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

// 🔥 FIX CORS FULL
app.use(cors({
  origin: "*", // sementara bebas dulu
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors()); // 🔥 handle preflight

app.use(express.json());

const SECRET_KEY = "SECRET_KEY"; // HARUS SAMA DENGAN AUTH SERVICE

// 🔐 Middleware JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token tidak ada" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Token tidak valid" });

    req.user = user;
    next();
  });
};

// 📥 GET (ambil data)
app.get("/applications", authenticateToken, (req, res) => {
  res.json([
    {
      id: 1,
      type: "KTP",
      status: "pending",
      user_id: req.user.id,
    },
  ]);
});

// 📤 POST (kirim pengajuan)
app.post("/applications", authenticateToken, (req, res) => {
  const { type } = req.body;

  if (!type) {
    return res.status(400).json({ error: "Type wajib diisi" });
  }

  res.json({
    message: "Pengajuan berhasil",
    data: {
      id: Date.now(),
      type,
      status: "pending",
      user_id: req.user.id, 
    },
  });
});

app.listen(4002, "0.0.0.0", () => {
  console.log("App Service running");
});