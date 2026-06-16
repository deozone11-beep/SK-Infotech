const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

// Task ID generate helper
async function generateTaskId() {
  const [rows] = await pool.query(
    "SELECT task_id FROM tasks ORDER BY id DESC LIMIT 1"
  );
  if (rows.length === 0) return "TSK_001";
  const last = rows[0].task_id;
  const num = parseInt(last.split("_")[1]);
  return "TSK_" + String(num + 1).padStart(3, "0");
}

// 📋 GET /api/tasks - All tasks (or filtered by employee)
router.get("/", async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) return res.status(401).json({ message: "Unauthorized" });

  try {
    let rows;
    if (currentUser.role === "employee") {
      // Employee-க்கு அவங்க task மட்டும்
      [rows] = await pool.query(
        "SELECT * FROM tasks WHERE emp_id = ? ORDER BY created_at DESC",
        [currentUser.id]
      );
    } else {
      // Admin / Team Lead - எல்லாம் பாக்கலாம்
      [rows] = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
    }

    // Frontend format-க்கு மாத்து
    const tasks = rows.map((t) => ({
      taskId: t.task_id,
      empId: t.emp_id,
      name: t.emp_name,
      mobile: t.mobile,
      project: t.project,
      task: t.task,
      days: t.days,
      status: t.status,
      createdBy: { id: t.created_by_id, name: t.created_by_name },
    }));

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Tasks fetch பண்ண முடியல" });
  }
});

// ➕ POST /api/tasks - Add task
router.post("/", async (req, res) => {
  const { empId, name, mobile, project, task, days } = req.body;
  const currentUser = req.user;

  if (!empId || !task) {
    return res.status(400).json({ message: "Employee மற்றும் Task கொடுக்கவும்" });
  }

  try {
    const taskId = await generateTaskId();
    await pool.query(
      `INSERT INTO tasks (task_id, emp_id, emp_name, mobile, project, task, days, status, created_by_id, created_by_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [taskId, empId, name, mobile, project, task, days, currentUser.id, currentUser.name]
    );
    res.json({ message: "Task add ஆச்சு ✅", taskId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Task add பண்ண முடியல" });
  }
});

// ✏️ PUT /api/tasks/:taskId - Update task details
router.put("/:taskId", async (req, res) => {
  const { empId, name, mobile, project, task, days } = req.body;
  const taskId = req.params.taskId;

  try {
    await pool.query(
      `UPDATE tasks SET emp_id=?, emp_name=?, mobile=?, project=?, task=?, days=? WHERE task_id=?`,
      [empId, name, mobile, project, task, days, taskId]
    );
    res.json({ message: "Task update ஆச்சு ✅" });
  } catch (err) {
    res.status(500).json({ message: "Update பண்ண முடியல" });
  }
});

// 🔄 PATCH /api/tasks/:taskId/status - Update task status only
router.patch("/:taskId/status", async (req, res) => {
  const { status } = req.body;
  const taskId = req.params.taskId;

  const allowed = ["pending", "inprogress", "completed"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    await pool.query("UPDATE tasks SET status=? WHERE task_id=?", [status, taskId]);
    res.json({ message: "Status update ஆச்சு ✅" });
  } catch (err) {
    res.status(500).json({ message: "Status update பண்ண முடியல" });
  }
});

// 🔍 GET /api/tasks/search?q=TSK_001 - Search by task ID
router.get("/search", async (req, res) => {
  const q = req.query.q || "";
  try {
    const [rows] = await pool.query(
      "SELECT * FROM tasks WHERE task_id LIKE ? LIMIT 10",
      [`%${q}%`]
    );
    const tasks = rows.map((t) => ({
      taskId: t.task_id,
      empId: t.emp_id,
      name: t.emp_name,
      mobile: t.mobile,
      project: t.project,
      task: t.task,
      days: t.days,
      status: t.status,
      createdBy: { id: t.created_by_id, name: t.created_by_name },
    }));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Search பண்ண முடியல" });
  }
});

module.exports = router;
