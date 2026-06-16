const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const pool = require("./config/db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",  // Tomcat
  ],
  credentials: true,
}));
app.use(express.json());

// ===== ROUTES =====
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/tasks", require("./routes/tasks"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ SK Infotech Backend Running", port: PORT });
});

// ===== DEFAULT DATA SEED =====
async function seedDefaultUsers() {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM users");
    
    if (rows[0].count > 0) return; // Already seeded

    console.log("⏳ Default users insert பண்றோம்...");

    const defaultUsers = [
      { id: "ADMIN", name: "Kumar", phone: "9003090694", password: "1", role: "admin" },
      { id: "TL1", name: "Preetha", phone: "9876543210", password: "1", role: "team_lead" },
      { id: "TL2", name: "Aishu", phone: "9876543211", password: "2", role: "team_lead" },
      { id: "EMP1", name: "Neethu", phone: "9876543212", password: "1", role: "employee" },
      { id: "EMP2", name: "Moni", phone: "9876543213", password: "2", role: "employee" },
    ];

    for (const u of defaultUsers) {
      const hashed = await bcrypt.hash(u.password, 10);
      await pool.query(
        "INSERT IGNORE INTO users (id, name, phone, password, role) VALUES (?, ?, ?, ?, ?)",
        [u.id, u.name, u.phone, hashed, u.role]
      );
    }

    console.log("✅ Default users insert ஆச்சு!");
  } catch (err) {
    console.error("Seed Error:", err.message);
  }
}

// ===== START SERVER =====
app.listen(PORT, async () => {
  console.log(`\n🚀 SK Infotech Backend: http://localhost:${PORT}`);
  console.log(`📡 API Ready: http://localhost:${PORT}/api/health\n`);
  await seedDefaultUsers();
});
