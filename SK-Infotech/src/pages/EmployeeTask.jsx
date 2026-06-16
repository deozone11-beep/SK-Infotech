import { useEffect, useState } from "react";
import "../css/EmployeeTask.css";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import { getTasksAPI, updateTaskStatusAPI } from "../services/api";

function EmployeeTask() {
  const nav = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  const pending = tasks.filter((t) => t.status === "pending" || !t.status).length;
  const progress = tasks.filter((t) => t.status === "inprogress").length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  const data = [
    { name: "Pending", value: pending || 0.1 },
    { name: "In Progress", value: progress || 0.1 },
    { name: "Completed", value: completed || 0.1 },
  ];
  const COLORS = ["orange", "blue", "green"];

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    setUser(currentUser);
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getTasksAPI(); // API auto filters by employee
      setTasks(data);
    } catch (err) {
      alert("Tasks load பண்ண முடியல: " + err.message);
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await updateTaskStatusAPI(taskId, status);
      setTasks((prev) => prev.map((t) => t.taskId === taskId ? { ...t, status } : t));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="emp-page">
      <div className="emp-topbar">
        <h2>Welcome {user?.name} 👨‍💻</h2>
        <div className="emp-nav-right">
          <button onClick={() => nav("/employee")}>🏠 Home</button>
          <button className="logout-btn" onClick={() => { localStorage.clear(); nav("/"); }}>
            Logout
          </button>
        </div>
      </div>

      <div className="emp-cards">
        <div className="emp-card pending">Pending: {pending}</div>
        <div className="emp-card progress">In Progress: {progress}</div>
        <div className="emp-card completed">Completed: {completed}</div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <PieChart width={300} height={250}>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
            {data.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
          </Pie>
          <Tooltip /><Legend />
        </PieChart>
      </div>

      <table className="emp-table">
        <thead>
          <tr>
            <th>Task ID</th><th>Project</th><th>Task</th><th>Days</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t, i) => (
            <tr key={i}>
              <td>{t.taskId}</td><td>{t.project}</td><td>{t.task}</td><td>{t.days}</td>
              <td><span className={`status-badge ${t.status}`}>{t.status || "pending"}</span></td>
              <td>
                <div className="action-btns">
                  <button className="progress-btn" onClick={() => updateStatus(t.taskId, "inprogress")}>
                    In Progress
                  </button>
                  <button className="complete-btn" onClick={() => updateStatus(t.taskId, "completed")}>
                    Completed
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTask;
