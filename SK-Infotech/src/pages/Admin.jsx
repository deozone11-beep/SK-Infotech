import "../css/Lead.css";
import { Link, useNavigate } from "react-router-dom";
import dashboardIcon from "../assets/dashboard.png";
import helper from "../assets/helper.png";
import user from "../assets/User.png";
import task from "../assets/task.png";
import track from "../assets/tracking.png";
import process from "../assets/process.png";
import workflow from "../assets/workflow.png";
import logout from "../assets/Logout.png";
import evm from "../assets/EVM.png";
import Reception from "../assets/reception.png";
import { useState } from "react";
import { useEffect } from "react";

const cards = [
  {
    title: "Task Management",
    desc: "Create and manage tasks, assign to employees and track progress",
    color: "green",
    iconSrc: task,
    path: "/SK-Infotech/tasks"
  },
  {
    title: "User Management",
    desc: "Create and manage users details and access",
    color: "blue",
    iconSrc: user,
    path: "/SK-Infotech/userManagement"
  },
  {
    title: "EVM Management",
    desc: "Create and manage EVM details and access",
    color: "blue",
    iconSrc: evm,
    path: "/SK-Infotech/evmManagement"
  },
  {
    title: "Reception Table",
    desc: "Create and manage Reception Table details and access",
    color: "blue",
    iconSrc: Reception,
    path: "/SK-Infotech/receptionTable"
  },
  {
    title: "Form Processing",
    desc: "All the received Forms will be visible and further action can be taken upon.",
    color: "orange",
    iconSrc: process,
    path: "/SK-Infotech/formprocess"
  },
  {
    title: "Dashboard & Reporting",
    desc: "Dashboard & Reporting solution to choose and generate quick reports using data of choice",
    color: "pink",
    iconSrc: dashboardIcon,
    path: "/SK-Infotech/dashboard"
  },
  {
    title: "Project Tracking",
    desc: "Track project progress and manage timelines effectively",
    color: "green",
    iconSrc: track,
    path: "/SK-Infotech/tracking"
  },
  {
    title: "Help",
    desc: "Help guide for various modules",
    color: "yellow",
    iconSrc: helper,
    path: "/SK-Infotech/help"
  },
  {
    title: "Project Workflow",
    desc: "View and manage the project workflow",
    color: "blue",
    iconSrc: workflow,
    path: "/SK-Infotech/workflow"
  }
];

function Admin() {
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
            onClick={() => {
  if (card.title === "EVM Management") {
    nav("/SK-Infotech/evmMenu"); // 👈 new page
  } else {
    nav(card.path);
  }
}}
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

export default Admin;