const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth");

// 🔒 All routes need login
router.use(authMiddleware);

// 📋 GET /api/users - All users list
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, phone, role FROM users ORDER BY FIELD(role, 'admin', 'team_lead', 'employee')"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Users fetch பண்ண முடியல" });
  }
});

// ➕ POST /api/users - Add new user
router.post("/", async (req, res) => {
  const { id, name, phone, password, role } = req.body;
  const currentUser = req.user;

  // Team Lead only employee add பண்ணலாம்
  if (currentUser.role === "team_lead" && role !== "employee") {
    return res.status(403).json({ message: "Team Lead-க்கு employee மட்டும் add பண்ண முடியும்" });
  }

  if (!id || !name || !password) {
    return res.status(400).json({ message: "ID, Name, Password கொடுக்கவும்" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (id, name, phone, password, role) VALUES (?, ?, ?, ?, ?)",
      [id.trim(), name.trim(), phone || "", hashedPassword, role || "employee"]
    );
    res.json({ message: "User add ஆச்சு ✅" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "இந்த ID already இருக்கு" });
    }
    res.status(500).json({ message: "User add பண்ண முடியல" });
  }
});

// ✏️ PUT /api/users/:id - Update user
router.put("/:id", async (req, res) => {
  const { name, phone, password, role } = req.body;
  const userId = req.params.id;

  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        "UPDATE users SET name=?, phone=?, password=?, role=? WHERE id=?",
        [name, phone, hashedPassword, role, userId]
      );
    } else {
      await pool.query(
        "UPDATE users SET name=?, phone=?, role=? WHERE id=?",
        [name, phone, role, userId]
      );
    }
    res.json({ message: "User update ஆச்சு ✅" });
  } catch (err) {
    res.status(500).json({ message: "Update பண்ண முடியல" });
  }
});

// 🗑️ DELETE /api/users/:id - Delete user
router.delete("/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    await pool.query("DELETE FROM users WHERE id = ?", [userId]);
    res.json({ message: "User deactivate ஆச்சு ✅" });
  } catch (err) {
    res.status(500).json({ message: "Delete பண்ண முடியல" });
  }
});

module.exports = router;
