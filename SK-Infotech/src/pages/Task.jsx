import { useState, useEffect } from "react";
import "../css/Task.css";
import { Link } from "react-router-dom";
import { getUsersAPI, getTasksAPI, addTaskAPI, updateTaskAPI } from "../services/api";

const projects = ["Construction", "Demolition", "Renovation", "Consultation"];

function Task() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.role === "admin";
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ empId: "", name: "", mobile: "", project: "", task: "", days: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, tasksData] = await Promise.all([getUsersAPI(), getTasksAPI()]);
      setEmployees(usersData.filter((u) => u.role === "employee"));
      setTasks(tasksData);
    } catch (err) {
      alert("Data load பண்ண முடியல: " + err.message);
    }
  };

  const handleEmployee = (id) => {
    const emp = employees.find((e) => e.id === id);
    if (emp) setForm({ ...form, empId: id, name: emp.name, mobile: emp.phone });
  };

  const handleSubmit = async () => {
    if (!form.empId || !form.task) return alert("Employee மற்றும் Task கொடுக்கவும்");
    setLoading(true);
    try {
      await addTaskAPI(form);
      setShowForm(false);
      resetForm();
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setForm({
      empId: task.empId, name: task.name, mobile: task.mobile,
      project: task.project, task: task.task, days: task.days,
    });
    setEditTaskId(task.taskId);
    setShowForm(true);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateTaskAPI(editTaskId, form);
      setEditTaskId(null);
      setShowForm(false);
      resetForm();
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setForm({ empId: "", name: "", mobile: "", project: "", task: "", days: "" });

  return (
    <div className="task-page">
      <div className="task-topbar">
        <h2>Task Management</h2>
        <div className="nav-right">
          <button onClick={() => nav(-1)}>🏠 Home</button>
        </div>
      </div>

      <div className="task-header">
        <button className="add-btn" onClick={() => { resetForm(); setEditTaskId(null); setShowForm(true); }}>
          ➕ Add Task
        </button>
      </div>

      {showForm && (
        <div className="task-form">
          <select onChange={(e) => handleEmployee(e.target.value)} value={form.empId}>
            <option value="">Select Employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.id} - {e.name}</option>
            ))}
          </select>
          <input value={form.name} placeholder="Employee Name" disabled />
          <input value={form.mobile} placeholder="Mobile" disabled />
          <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
            <option value="">Select Project</option>
            {projects.map((p, i) => <option key={i}>{p}</option>)}
          </select>
          <input value={form.task} placeholder="Task Name"
            onChange={(e) => setForm({ ...form, task: e.target.value })} />
          <input type="number" value={form.days} placeholder="Days"
            onChange={(e) => setForm({ ...form, days: e.target.value })} />
          <div className="form-actions">
            {editTaskId ? (
              <button className="submit" onClick={handleUpdate} disabled={loading}>
                {loading ? "Updating..." : "Update"}
              </button>
            ) : (
              <button className="submit" onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            )}
            <button className="cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <table className="task-table">
        <thead>
          <tr>
            <th>Task ID</th><th>Emp ID</th><th>Name</th><th>Mobile</th>
            <th>Project</th><th>Task</th><th>Days</th><th>Status</th>
            {isAdmin && <th>Created By</th>}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t, i) => (
            <tr key={i}>
              <td>{t.taskId}</td><td>{t.empId}</td><td>{t.name}</td><td>{t.mobile}</td>
              <td>{t.project}</td><td>{t.task}</td><td>{t.days}</td>
              <td><span className={`status-badge ${t.status}`}>{t.status}</span></td>
              {isAdmin && <td>{t.createdBy?.id} - {t.createdBy?.name}</td>}
              <td>
                <button className="edit-btn" onClick={() => handleEdit(t)}>Update</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Task;
