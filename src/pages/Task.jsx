import { useState, useEffect } from "react";
import "../css/Task.css";
import { users as defaultUsers } from "../data/data";
import { Link } from "react-router-dom";

const projects = ["Construction", "Demolition", "Renovation", "Consultation"];

function Task() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.role === "admin";
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const generateTaskId = (tasks) => {
  const last = tasks[tasks.length - 1];
  if (!last) return "TSK_001";

  const num = parseInt(last.taskId.split("_")[1]);
  return "TSK_" + String(num + 1).padStart(3, "0");
};

  const [form, setForm] = useState({
    empId: "",
    name: "",
    mobile: "",
    project: "",
    task: "",
    days: ""
  });


  useEffect(() => {
    let storedUsers = JSON.parse(localStorage.getItem("users"));

    if (!storedUsers) {
      localStorage.setItem("users", JSON.stringify(defaultUsers));
      storedUsers = defaultUsers;
    }

    const empList = storedUsers.filter((u) => u.role === "employee");
    setEmployees(empList);

    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(storedTasks);
  }, []);

  
  const handleEmployee = (id) => {
    const emp = employees.find((e) => e.id === id);

    setForm({
      ...form,
      empId: id,
      name: emp.name,
      mobile: emp.phone
    });
  };

  const handleSubmit = () => {
  if (!form.empId || !form.task) return alert("Fill all fields");

  const newTask = {
  ...form,
  taskId: generateTaskId(tasks),
  status: "pending",   // ✅ இத add பண்ணு bro
  createdBy: {
    id: currentUser?.id,
    name: currentUser?.name
  }
};

  const updated = [...tasks, newTask];

  setTasks(updated);
  localStorage.setItem("tasks", JSON.stringify(updated));

  setShowForm(false);
  resetForm();
};


  const handleEdit = (index) => {
    setForm(tasks[index]);
    setEditIndex(index);
    setShowForm(true);
  };


  const handleUpdate = () => {
  const updated = [...tasks];

  updated[editIndex] = {
    ...form,
    status: tasks[editIndex].status || "pending" // ✅ இது add பண்ணு
  };

  setTasks(updated);
  localStorage.setItem("tasks", JSON.stringify(updated));

  setEditIndex(null);
  setShowForm(false);
  resetForm();
};

  const resetForm = () => {
    setForm({
      empId: "",
      name: "",
      mobile: "",
      project: "",
      task: "",
      days: ""
    });
  };

  return (
    <div className="task-page">

        <div className="task-topbar">
            <h2>Task Management</h2>

            <div className="nav-right">
            <button><Link to="/teamlead">🏠 Home</Link></button>
            </div>
        </div>

        <div className="task-header">
            <button className="add-btn" onClick={() => setShowForm(true)}>
            ➕ Add Task
            </button>
        </div>

      {showForm && (
        <div className="task-form">

          <select onChange={(e) => handleEmployee(e.target.value)} value={form.empId}>
            <option>Select Employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.id}
              </option>
            ))}
          </select>

          <input value={form.name} disabled />
          <input value={form.mobile} disabled />

          <select
            value={form.project}
            onChange={(e) =>
              setForm({ ...form, project: e.target.value })
            }
          >
            <option>Select Project</option>
            {projects.map((p, i) => (
              <option key={i}>{p}</option>
            ))}
          </select>

          <input
            value={form.task}
            placeholder="Task Name"
            onChange={(e) =>
              setForm({ ...form, task: e.target.value })
            }
          />

          <input
            type="number"
            value={form.days}
            placeholder="Days"
            onChange={(e) =>
              setForm({ ...form, days: e.target.value })
            }
          />

          <div className="form-actions">
            {editIndex !== null ? (
              <button className="submit" onClick={handleUpdate}>
                Update
              </button>
            ) : (
              <button className="submit" onClick={handleSubmit}>
                Submit
              </button>
            )}

            <button className="cancel" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>

        </div>
      )}


      <table className="task-table">
        <thead>
          <tr>
            <th>Task ID</th>
            <th>Emp ID</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>Project</th>
            <th>Task</th>
            <th>Days</th>

            {isAdmin && <th>Created By</th>}

            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((t, i) => (
            <tr key={i}>
                <td>{t.taskId}</td>
                <td>{t.empId}</td>
                <td>{t.name}</td>
                <td>{t.mobile}</td>
                <td>{t.project}</td>
                <td>{t.task}</td>
                <td>{t.days}</td>
                {isAdmin && (
                    <td>
                        {t.createdBy?.id} - {t.createdBy?.name}
                    </td>
                )}
                <td>
                    <button className="edit-btn" onClick={() => handleEdit(i)}>
                    Update
                    </button>
                </td>
                </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default Task;