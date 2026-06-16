-- ============================================
-- SK INFOTECH - MySQL Database Setup
-- MySQL Workbench / phpMyAdmin-ல run பண்ணவும்
-- ============================================

CREATE DATABASE IF NOT EXISTS sk_infotech;
USE sk_infotech;

-- 👤 USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'team_lead', 'employee') NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📋 TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id VARCHAR(20) UNIQUE NOT NULL,
  emp_id VARCHAR(20) NOT NULL,
  emp_name VARCHAR(100),
  mobile VARCHAR(15),
  project VARCHAR(100),
  task VARCHAR(255) NOT NULL,
  days INT,
  status ENUM('pending', 'inprogress', 'completed') DEFAULT 'pending',
  created_by_id VARCHAR(20),
  created_by_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (emp_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 🔐 DEFAULT USERS (password = bcrypt of "1" and "2")
-- NOTE: server start ஆகும்போது auto insert ஆகும், manual insert வேண்டாம்

-- ✅ Indexes for performance
CREATE INDEX idx_tasks_emp_id ON tasks(emp_id);
CREATE INDEX idx_tasks_status ON tasks(status);
