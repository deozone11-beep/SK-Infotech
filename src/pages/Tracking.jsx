import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Tracking.css";

function Tracking() {
  const [tasks, setTasks] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [result, setResult] = useState(null);

  const nav = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.role === "admin";
  const isLead = currentUser?.role === "lead";

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(storedTasks);
  }, []);

  // 🔍 INPUT SEARCH
  const handleInput = (value) => {
    setSearchId(value);

    const filtered = tasks.filter((t) =>
      t.taskId?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredTasks(filtered);
  };

  // ✅ SELECT FROM DROPDOWN
  const selectTask = (task) => {
    setSearchId(task.taskId);
    setResult(task);
    setFilteredTasks([]);
  };

  // 🔄 REINITIATE
  const handleReinitiate = (taskId) => {
    const updated = tasks.map((t) =>
      t.taskId === taskId ? { ...t, status: "pending" } : t
    );

    setTasks(updated);
    localStorage.setItem("tasks", JSON.stringify(updated));

    if (result?.taskId === taskId) {
      setResult({ ...result, status: "pending" });
    }
  };

  return (
    <div className="tracking-page">

      {/* 🔵 NAV BAR */}
      <div className="tracking-topbar">
        <h2>Task Tracking 🔍</h2>
        <button onClick={() => nav(-1)}>⬅ Back</button>
      </div>

      {/* 🔍 SEARCH */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search Task ID..."
          value={searchId}
          onChange={(e) => handleInput(e.target.value)}
        />

        {filteredTasks.length > 0 && (
          <div className="dropdown">
            {filteredTasks.map((t, i) => (
              <div
                key={i}
                className="dropdown-item"
                onClick={() => selectTask(t)}
              >
                {t.taskId}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📊 RESULT CARD */}
      {result && (
        <div className="result-card">
          <p><b>Task ID:</b> {result.taskId}</p>
          <p><b>Project:</b> {result.project}</p>
          <p><b>Task:</b> {result.task}</p>
          <p><b>Employee:</b> {result.empId} - {result.name}</p>

          <p>
            <b>Status:</b>{" "}
            <span className={`status ${result.status}`}>
              {result.status}
            </span>
          </p>

          <p>
            <b>Created By:</b>{" "}
            {typeof result.createdBy === "object"
              ? `${result.createdBy.id} - ${result.createdBy.name}`
              : result.createdBy}
          </p>

          {(isAdmin || isLead) && (
            <button
              className="re-btn"
              onClick={() => handleReinitiate(result.taskId)}
            >
              🔄 Re-Initiate
            </button>
          )}
        </div>
      )}

    </div>
  );
}

export default Tracking;