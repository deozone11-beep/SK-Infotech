import "../css/Lead.css";
import "../css/ReceptionTable.css";
import { Link, useNavigate } from "react-router-dom";
import dashboardIcon from "../assets/dashboard.png";
import helper from "../assets/helper.png";
import Receptions from "../assets/Receptiont.png";
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
    title: "17-C & 17-A Form Management",
    desc: "Create and manage form",
    color: "green",
    iconSrc: task,
    path: "/SK-Infotech/receptionTable/documentCheck"
  },
  {
    title: "Reception Table Report",
    desc: "Create and manage users details and access",
    color: "blue",
    iconSrc: Receptions,
    path: "/SK-Infotech/userManagement"
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
    <div className="Reception-dashboard">
      <nav className="Reception-nav">
        <h2>Welcome, {formatName(user?.name)}</h2>
          <h2 className="reception-btn-back" onClick={() => nav(-1)}>
            ⬅ Back
          </h2>
        </nav>
      <div className="Rec-card-container">
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