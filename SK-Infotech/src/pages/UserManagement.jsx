import { useState, useEffect } from "react";
import "../css/UserManagement.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getUsersAPI, addUserAPI, updateUserAPI, deleteUserAPI } from "../services/api";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [loading, setLoading] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.role === "admin";

  const [form, setForm] = useState({ id: "", name: "", phone: "", password: "", role: "employee" });

  const togglePassword = (id) => setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsersAPI();
      setUsers(data);
    } catch (err) {
      alert("Users load பண்ண முடியல: " + err.message);
    }
  };

  const handleAdd = async () => {
    if (!form.id || !form.name || !form.password) return alert("Fill all fields");
    setLoading(true);
    try {
      await addUserAPI(form);
      setForm({ id: "", name: "", phone: "", password: "", role: "employee" });
      await fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setForm({ ...user, password: "" });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateUserAPI(editId, form);
      setEditId(null);
      setForm({ id: "", name: "", phone: "", password: "", role: "employee" });
      await fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deactivate பண்ணலாமா?")) return;
    try {
      await deleteUserAPI(id);
      await fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="user-page">
      <nav className="user-nav">
        <h2>User Management 👨‍💼</h2>
        <h3><Link to="/teamlead">Home</Link></h3>
      </nav>

      <div className="user-form">
        <input placeholder="User ID" value={form.id} disabled={!!editId}
          onChange={(e) => setForm({ ...form, id: e.target.value })} />
        <input placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Phone Number" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
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
          <button onClick={handleUpdate} disabled={loading}>{loading ? "Updating..." : "Update"}</button>
        ) : (
          <button onClick={handleAdd} disabled={loading}>{loading ? "Adding..." : "Add User"}</button>
        )}
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Phone</th><th>Role</th><th>Password</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.filter((u) => isAdmin || u.role === "employee").map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.phone}</td>
              <td>{u.role}</td>
              <td>
                <div className="password-cell">
                  {showPassword[u.id] ? (u.password || "••••") : "*****"}
                  <span className="eye" onClick={() => togglePassword(u.id)}>
                    {showPassword[u.id] ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </td>
              <td>
                <div className="action-btns">
                  <button className="edit" onClick={() => handleEdit(u)}>Update</button>
                  <button className="delete" onClick={() => handleDelete(u.id)}>Deactivate</button>
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
