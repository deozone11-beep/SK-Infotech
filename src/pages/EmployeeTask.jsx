import { useEffect, useState } from "react";
import "../css/EmployeeTask.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";
import { useNavigate } from "react-router-dom";



function EmployeeTask() {
  const nav = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  
  const pending = tasks.filter(
  (t) => t.status === "pending" || !t.status
).length;

const progress = tasks.filter(
  (t) => t.status === "inprogress"
).length;

const completed = tasks.filter(
  (t) => t.status === "completed"
).length;

  const data = [
  { name: "Pending", value: pending },
  { name: "In Progress", value: progress },
  { name: "Completed", value: completed }
];

const COLORS = ["orange", "blue", "green"];

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];

    setUser(currentUser);
    const empTasks = allTasks.filter(
      (t) => t.empId === currentUser.id
    );

    setTasks(empTasks);
  }, []);

  const updateStatus = (index, status) => {
    const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const taskId = tasks[index].taskId;
    const updated = allTasks.map((t) =>
      t.taskId === taskId ? { ...t, status } : t
    );

    localStorage.setItem("tasks", JSON.stringify(updated));

    // update UI
    const updatedTasks = tasks.map((t, i) =>
      i === index ? { ...t, status } : t
    );

    setTasks(updatedTasks);
  };



  return (
    <div className="emp-page">

        <div className="emp-topbar">
            <h2>Welcome {user?.name} 👨‍💻</h2>

            <div className="emp-nav-right">
                <button onClick={() => nav("/employee")}>🏠 Home</button>

                <button
                className="logout-btn"
                onClick={() => {
                    localStorage.removeItem("user");
                    nav("/");
                }}
                >
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
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
      <table className="emp-table">
        <thead>
          <tr>
            <th>Task ID</th>
            <th>Project</th>
            <th>Task</th>
            <th>Days</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((t, i) => (
            <tr key={i}>
              <td>{t.taskId}</td>
              <td>{t.project}</td>
              <td>{t.task}</td>
              <td>{t.days}</td>

              <td>{t.status || "pending"}</td>

              <td>
                <div className="action-btns">
                  <button
                    className="progress-btn"
                    onClick={() => updateStatus(i, "inprogress")}
                  >
                    In Progress
                  </button>

                  <button
                    className="complete-btn"
                    onClick={() => updateStatus(i, "completed")}
                  >
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