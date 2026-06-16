import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Tracking.css";
import { searchTasksAPI, updateTaskStatusAPI } from "../services/api";

function Tracking() {
  const [searchId, setSearchId] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [result, setResult] = useState(null);
  const nav = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.role === "admin";
  const isLead = currentUser?.role === "team_lead";

  const handleInput = async (value) => {
    setSearchId(value);
    if (!value.trim()) { setFilteredTasks([]); return; }
    try {
      const data = await searchTasksAPI(value);
      setFilteredTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectTask = (task) => {
    setSearchId(task.taskId);
    setResult(task);
    setFilteredTasks([]);
  };

  const handleReinitiate = async (taskId) => {
    try {
      await updateTaskStatusAPI(taskId, "pending");
      setResult({ ...result, status: "pending" });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="tracking-page">
      <div className="tracking-topbar">
        <h2>Task Tracking 🔍</h2>
        <button onClick={() => nav(-1)}>⬅ Back</button>
      </div>

      <div className="search-box">
        <input
          type="text" placeholder="Search Task ID..." value={searchId}
          onChange={(e) => handleInput(e.target.value)}
        />
        {filteredTasks.length > 0 && (
          <div className="dropdown">
            {filteredTasks.map((t, i) => (
              <div key={i} className="dropdown-item" onClick={() => selectTask(t)}>
                {t.taskId} — {t.task}
              </div>
            ))}
          </div>
        )}
      </div>

      {result && (
        <div className="result-card">
          <p><b>Task ID:</b> {result.taskId}</p>
          <p><b>Project:</b> {result.project}</p>
          <p><b>Task:</b> {result.task}</p>
          <p><b>Employee:</b> {result.empId} - {result.name}</p>
          <p>
            <b>Status:</b>{" "}
            <span className={`status ${result.status}`}>{result.status}</span>
          </p>
          <p>
            <b>Created By:</b>{" "}
            {typeof result.createdBy === "object"
              ? `${result.createdBy?.id} - ${result.createdBy?.name}`
              : result.createdBy}
          </p>
          {(isAdmin || isLead) && (
            <button className="re-btn" onClick={() => handleReinitiate(result.taskId)}>
              🔄 Re-Initiate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Tracking;
