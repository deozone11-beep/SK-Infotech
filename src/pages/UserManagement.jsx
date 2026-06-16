import { useState, useEffect } from "react";
import "../css/UserManagement.css";
import { users as defaultUsers } from "../data/data";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";


function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.role === "admin";
  const [form, setForm] = useState({
    id: "",
    name: "",
    password: "",
    role: "employee"
  });

  const togglePassword = (id) => {
        setShowPassword((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };
  
  


useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("users"));
  if (stored) {
    setUsers(stored);
  } else {
    setUsers(defaultUsers);
    localStorage.setItem("users", JSON.stringify(defaultUsers));
  }
}, []);

  const saveToLocal = (data) => {
    setUsers(data);
    localStorage.setItem("users", JSON.stringify(data));
  };

  // 🟢 CREATE USER
  const handleAdd = () => {
  if (!form.id || !form.name) return alert("Fill all fields");

  let updated = [...users];

  if (form.role === "team_lead") {
    // last lead index
    const lastLeadIndex = [...users]
      .map((u, i) => (u.role === "team_lead" ? i : -1))
      .filter((i) => i !== -1)
      .pop();

    updated.splice(lastLeadIndex + 1, 0, form);
  } else {
    // last employee index
    const lastEmpIndex = [...users]
      .map((u, i) => (u.role === "employee" ? i : -1))
      .filter((i) => i !== -1)
      .pop();

    updated.splice(lastEmpIndex + 1, 0, form);
  }

  saveToLocal(updated);

  setForm({ id: "", name: "", phone: "", password: "", role: "employee" });
};

  // 🟡 EDIT USER
  const handleEdit = (user) => {
    setEditId(user.id);
    setForm(user);
  };

  // 🔵 UPDATE USER
  const handleUpdate = () => {
    const updated = users.map((u) =>
      u.id === editId ? form : u
    );

    saveToLocal(updated);
    setEditId(null);
    setForm({ id: "", name: "", phone: "", password: "", role: "employee" });
  };

  // 🔴 DELETE / DEACTIVATE
  const handleDelete = (id) => {
    const updated = users.filter((u) => u.id !== id);
    saveToLocal(updated);
  };

  return (
    <div className="user-page">
        <nav className="user-nav">
            <h2>User Management 👨‍💼</h2>
            <h3><Link to="/teamlead">Home</Link></h3>
        </nav>

      {/* 🔹 FORM */}
      <div className="user-form">
        <input
          placeholder="User ID"
          value={form.id}
          disabled={editId} // edit modeல ID change பண்ண முடியாது
          onChange={(e) => setForm({ ...form, id: e.target.value })}
        />

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
            {isAdmin ? (
                <>
                <option value="employee">Employee</option>
                <option value="team_lead">Team Lead</option>
                </>
            ) : (
                <option value="employee">Employee</option>
            )}
        </select>

        {editId ? (
          <button onClick={handleUpdate}>Update</button>
        ) : (
          <button onClick={handleAdd}>Add User</button>
        )}
      </div>

      {/* 🔹 TABLE */}
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Role</th>
            <th>Password</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users
            .filter((u) => isAdmin || u.role === "employee")
            .map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.phone}</td>
              <td>{u.role}</td>
              <td>
                <div className="password-cell">
                    {showPassword[u.id] ? u.password : "*****"}

                    <span
                    className="eye"
                    onClick={() => togglePassword(u.id)}
                    >
                    {showPassword[u.id] ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                </td>
              <td>
                <div className="action-btns">

                    {/* ADMIN full access */}
                    {isAdmin && (
                    <>
                        <button className="edit" onClick={() => handleEdit(u)}>
                        Update
                        </button>
                        <button className="delete" onClick={() => handleDelete(u.id)}>
                        Deactivate
                        </button>
                    </>
                    )}

                    {/* TEAM LEAD only employee */}
                    {!isAdmin && u.role === "employee" && (
                    <>
                        <button className="edit" onClick={() => handleEdit(u)}>
                        Update
                        </button>
                        <button className="delete" onClick={() => handleDelete(u.id)}>
                        Deactivate
                        </button>
                    </>
                    )}

                </div>
                </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default UserManagement;