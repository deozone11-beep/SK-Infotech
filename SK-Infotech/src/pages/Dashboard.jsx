import { useEffect, useState } from "react";
import "../css/Dashboard.css";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import { getUsersAPI, getTasksAPI } from "../services/api";

function Dashboard() {
  const nav = useNavigate();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filterType, setFilterType] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, t] = await Promise.all([getUsersAPI(), getTasksAPI()]);
        setUsers(u);
        setTasks(t);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const totalUsers = isAdmin ? users.length : users.filter((u) => u.role === "employee").length;
  const totalTasks = tasks.length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const progress = tasks.filter((t) => t.status === "inprogress").length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  const chartData = [
    { name: "Pending", value: pending || 0.1 },
    { name: "In Progress", value: progress || 0.1 },
    { name: "Completed", value: completed || 0.1 },
  ];
  const COLORS = ["orange", "blue", "green"];

  let filteredTasks = tasks;
  if (filterType === "pending") filteredTasks = tasks.filter((t) => t.status === "pending");
  else if (filterType === "inprogress") filteredTasks = tasks.filter((t) => t.status === "inprogress");
  else if (filterType === "completed") filteredTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="dashboard-page">
      <div className="dash-header">
        <h2>Dashboard 📊</h2>
        <h3>Welcome {currentUser?.name} 👨‍💼</h3>
        <button className="dash-back-btn" onClick={() => nav(-1)}>⬅ Back</button>
      </div>

      <div className="dash-cards">
        <div className="dash-card dash-users" onClick={() => setFilterType("users")}>👥 Users <br /> {totalUsers}</div>
        <div className="dash-card dash-tasks" onClick={() => setFilterType("all")}>📋 Tasks <br /> {totalTasks}</div>
        <div className="dash-card dash-pending" onClick={() => setFilterType("pending")}>🟠 Pending <br /> {pending}</div>
        <div className="dash-card dash-progress" onClick={() => setFilterType("inprogress")}>🔵 In Progress <br /> {progress}</div>
        <div className="dash-card dash-completed" onClick={() => setFilterType("completed")}>🟢 Completed <br /> {completed}</div>
      </div>

      <div className="chart-box">
        <PieChart width={320} height={260}>
          <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
            {chartData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
          </Pie>
          <Tooltip /><Legend />
        </PieChart>
      </div>

      {filterType === "users" && (
        <div className="task-report">
          <h3>User List</h3>
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Role</th></tr></thead>
            <tbody>{users.map((u) => <tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.role}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {filterType !== "users" && filterType !== "" && (
        <div className="task-report">
          <h3>Task Report</h3>
          <table>
            <thead><tr><th>ID</th><th>Employee</th><th>Project</th><th>Status</th></tr></thead>
            <tbody>
              {filteredTasks.length === 0
                ? <tr><td colSpan="4">No Data</td></tr>
                : filteredTasks.map((t, i) => (
                  <tr key={i}><td>{t.taskId}</td><td>{t.empId}</td><td>{t.project}</td><td>{t.status}</td></tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
