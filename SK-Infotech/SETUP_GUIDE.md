# SK Infotech - Complete Setup Guide
## React + Node.js + MySQL + Tomcat Deploy

---

## 📁 Project Structure

```
sk-infotech/
├── SK-Infotech/          ← React Frontend (உன் existing project)
│   └── src/
│       └── services/
│           └── api.js    ← NEW: API helper (localStorage மாத்தி இது use பண்ணோம்)
│
└── sk-backend/           ← NEW: Node.js Backend
    ├── index.js
    ├── .env
    ├── database.sql
    ├── config/db.js
    ├── middleware/auth.js
    └── routes/
        ├── auth.js
        ├── users.js
        └── tasks.js
```

---

## STEP 1: MySQL Setup

1. MySQL Workbench அல்லது XAMPP phpMyAdmin திற
2. `sk-backend/database.sql` file-ஐ copy பண்ணி run பண்ணு
3. Database `sk_infotech` create ஆகும்

---

## STEP 2: Backend Setup

```bash
# Terminal-ல:
cd sk-backend

# .env file திற → உன் MySQL password போடு:
DB_PASSWORD=உன்_mysql_password

# Backend start:
node index.js
```

✅ `http://localhost:5000/api/health` திறந்தா பாரு — "SK Infotech Backend Running" வரணும்

Default users auto insert ஆகும்:
- ADMIN / 1
- TL1 / 1 , TL2 / 2
- EMP1 / 1 , EMP2 / 2

---

## STEP 3: Frontend Setup (Dev Mode)

```bash
cd SK-Infotech
npm install
npm run dev
```

`http://localhost:5173` — login பண்ணி test பண்ணு

---

## STEP 4: Tomcat Deploy (Production)

### 4a. Frontend Build

```bash
cd SK-Infotech

# vite.config.js-ல base add பண்ணு:
# base: '/SK-Infotech/',

npm run build
# dist/ folder create ஆகும்
```

### 4b. Tomcat-ல Deploy

1. Tomcat-ஐ download பண்ணு: https://tomcat.apache.org
2. `dist/` folder-ஐ rename பண்ணி `SK-Infotech` வை
3. `tomcat/webapps/SK-Infotech/` folder-ல போடு
4. Tomcat start பண்ணு:
   ```
   Windows: tomcat/bin/startup.bat
   Linux/Mac: ./tomcat/bin/startup.sh
   ```
5. `http://localhost:8080/SK-Infotech/` → திறக்கும்!

### 4c. Backend Production

```bash
cd sk-backend

# .env-ல FRONTEND_URL மாத்து:
FRONTEND_URL=http://localhost:8080

node index.js
# அல்லது PM2 use பண்ணு (background-ல run):
npm install -g pm2
pm2 start index.js --name sk-backend
```

---

## API Endpoints Reference

| Method | URL | பயன் |
|--------|-----|------|
| POST | /api/auth/login | Login |
| GET | /api/users | All users |
| POST | /api/users | User add |
| PUT | /api/users/:id | User update |
| DELETE | /api/users/:id | User delete |
| GET | /api/tasks | All tasks |
| POST | /api/tasks | Task add |
| PUT | /api/tasks/:taskId | Task update |
| PATCH | /api/tasks/:taskId/status | Status update |
| GET | /api/tasks/search?q= | Task search |

---

## ❌ Common Issues & Fix

| Problem | Fix |
|---------|-----|
| CORS Error | .env-ல FRONTEND_URL சரியா போடு |
| DB Connection fail | .env-ல DB_PASSWORD சரியா போடு, MySQL running-ஆ check பண்ணு |
| 401 Unauthorized | Token expire ஆச்சு, logout → login பண்ணு |
| Tomcat 404 | dist folder name சரியா இருக்கான்னு check பண்ணு |

---

## ✅ What Changed (localStorage → MySQL)

| Before | After |
|--------|-------|
| localStorage users | MySQL `users` table |
| localStorage tasks | MySQL `tasks` table |
| No security | JWT Token authentication |
| Browser clear → data gone | MySQL-ல permanent save |
| One device only | Any device access |
