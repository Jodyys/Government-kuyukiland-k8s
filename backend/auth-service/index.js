const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const SECRET_KEY = "SECRET_KEY";

// 🐘 PostgreSQL connection docker
//const pool = new Pool({
  //user: "admin",
  //host: "postgres",
  //database: "government",
  //password: "admin",
  //port: 5432,
//});

// connect to postgres rds aws
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log("✅ AUTH DB Connected"))
  .catch(err => console.error("❌ AUTH DB Error:", err));

// 🔐 Middleware JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Token tidak ada" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token invalid" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token tidak valid" });
    }

    req.user = user;
    next();
  });
};

// 🔐 LOGIN
app.post("/login", async (req, res) => {
  const { nik, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM citizens WHERE nik=$1",
      [nik]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User tidak ditemukan" });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Password salah" });
    }

    const token = jwt.sign(
      { id: user.id, nik: user.nik },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

  res.json({
   message: "Login berhasil",
   user: {
    id: user.id,
    nik: user.nik,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    kecamatan: user.kecamatan,
    kelurahan: user.kelurahan
  },
   token,
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 📝 REGISTER
app.post("/register", async (req, res) => {
  const { nik, first_name, last_name, email, password, phone, kecamatan, kelurahan } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO citizens (nik, first_name, last_name, email, password, phone, kecamatan, kelurahan) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
      [nik, first_name, last_name, email, hashedPassword, phone, kecamatan, kelurahan]
    );

    res.json({ message: "User berhasil didaftarkan" });

  } 
  
  catch (err) {
    console.error(err);
    if (err.code === "23505") { 
      if (err.detail && err.detail.includes("nik")) {
        return res.status(400).json({ error: "NIK sudah terdaftar" });
      }
      if (err.detail && err.detail.includes("email")) {
        return res.status(400).json({ error: "Email sudah terdaftar" });
      }
    }
    }

    res.status(500).json({ error: "Gagal register" });
  });

// 🔒 PROTECTED ROUTE
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nik, first_name, last_name, email, phone, kecamatan, kelurahan, last_login FROM citizens WHERE id=$1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 🚀 START SERVER
app.listen(4001, () => {
  console.log("🚀 Auth Service running on port 4001");
});