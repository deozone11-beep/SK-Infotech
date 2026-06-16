import { useNavigate } from "react-router-dom";
import "../css/EvmMenu.css";
import { useEffect, useState } from "react";

function EvmMenu() {
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
    <div className="evm-menu-page">

      <div className="final-evm-header">
        <h2 className="final-poll-user">Welcome, {formatName(user?.name)}</h2>
        <h2 className="final-evm-title">⚙️ EVM Management</h2>
          <h2 className="polling-btn-back" onClick={() => nav(-1)}>
            ⬅ Back
          </h2>
      </div>
      {/* <div className="evm-menu-header">
        <h2>⚙️ EVM Management</h2>
        <button className="evm-back-btn" onClick={() => nav(-1)}>
          ⬅ Back
        </button>
      </div> */}

      <div className="evm-menu-cards">

        <div
          className="evm-menu-card evm-card-candidate"
          onClick={() => nav("/SK-Infotech/evmManagement")}
        >
          <h3>📋 Candidate Set</h3>
          <p>Manage candidate and machine mapping</p>
        </div>

        <div
          className="evm-menu-card evm-card-final"
          onClick={() => nav("/SK-Infotech/finalPollingMachine")}
        >
          <h3>🗳️ Final Polling Machine</h3>
          <p>Handle final machine allocation & reports</p>
        </div>

      </div>

    </div>
  );
}

export default EvmMenu;