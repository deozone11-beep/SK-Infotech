import "../css/Help.css";
import { useNavigate } from "react-router-dom";

function Help() {
  const nav = useNavigate();

  return (
    <div className="help-page">

      <div className="help-topbar">
        <h2>Help & Guide 📘</h2>
        <button onClick={() => nav(-1)}>⬅ Back</button>
      </div>

      <div className="help-container">

        <div className="help-card">
          <h3>📝 Task Management</h3>
          <p>
            You can create tasks, assign them to employees and track progress
            using status (Pending / In Progress / Completed).
          </p>
        </div>

        <div className="help-card">
          <h3>👤 User Management</h3>
          <p>
            Admin can add/edit both Team Leads and Employees. Team Leads can only
            manage employees.
          </p>
        </div>

        <div className="help-card">
          <h3>📊 Dashboard</h3>
          <p>
            View task summary using charts and status counts. Helps track overall
            performance.
          </p>
        </div>

        <div className="help-card">
          <h3>🔄 Task Status</h3>
          <p>
            Employees can update their task status. This reflects in admin and
            team lead dashboards.
          </p>
        </div>

        <div className="help-card">
          <h3>❓ Support</h3>
          <p>
            For any issues, contact system admin or check system logs for errors.
          </p>
        </div>

      </div>

    </div>
  );
}

export default Help;