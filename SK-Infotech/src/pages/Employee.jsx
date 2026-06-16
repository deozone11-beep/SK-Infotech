import "../css/Lead.css";
import { Link, useNavigate } from "react-router-dom";
import dashboardIcon from "../assets/dashboard.png";
import helper from "../assets/helper.png";
import user from "../assets/User.png";
import task from "../assets/task.png";
import track from "../assets/tracking.png";
import logout from "../assets/Logout.png";
import evm from "../assets/EVM.png";
import { useState } from "react";
import { useEffect } from "react";

const cards = [
  {
    title: "My Tasks",
    desc: "Tasks assigned to you will be visible here. You can also update the status of the task.",
    color: "green",
    iconSrc: task,
    path: "/SK-Infotech/employee-task"
  },
  {
    title: "Tracking",
    desc: "Track the progress of your tasks and projects.",
    color: "orange",
    iconSrc: track,
    path: "/SK-Infotech/tracking"
  },
    {
    title: "EVM Management",
    desc: "Create and manage EVM details and access",
    color: "blue",
    iconSrc: evm,
    path: "/SK-Infotech/evmManagement"
  },
  {
    title: "Help",
    desc: "Help guide for various modules",
    color: "blue",
    iconSrc: helper,
    path: "/SK-Infotech/help"
  }
];

function Employee() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);

  const formatName = (name) =>
  name?.charAt(0).toUpperCase() + name?.slice(1);

  useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (!storedUser) {
    nav("/");
  } else {
    setUser(storedUser);
  }
}, []);
  
  return (
    <div className="dashboard">
      <nav className="team-lead-nav">
        <h2>Welcome, {formatName(user?.name)}</h2>
          <img src={logout} alt="Logout" className="logout-image"
          onClick={() => {
            localStorage.removeItem("user");
            nav("/SK-Infotech");
          }}/> 
      </nav>
      <div className="card-container">
        {cards.map((card, index) => (
          <div
            className={`card ${card.color}`}
            key={index}
            onClick={() => nav(card.path)}
          >
          <div className="card-top">
            <img src={card.iconSrc} alt="icon" className="card-icon" />
            <h3>{card.title}</h3>
          </div>

            <p>{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Employee;