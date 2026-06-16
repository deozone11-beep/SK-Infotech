import { useNavigate } from "react-router-dom";
import "../css/workflow.css";

const steps = [
  "Start",
  "The values are taken from the browser's local storage at initialization.",
  "Login",
  "Any updates made by the user (Update/Create Task) will be added to and updated in the browser's local storage.",
  "Data displayed on the dashboard using the browser's local storage",
  "Dashboard Updated",
  "Finish"
];

function Workflow() {
  const nav = useNavigate();
  return (
    <div className="workflow-container">
      <h2 className="workflow-title">Workflow</h2>

      <div className="timeline">
        {steps.map((step, index) => (
          <div className="step" key={index}>
            <div className="circle">{index + 1}</div>
            <div className="content">{step}</div>
          </div>
        ))}
      </div>
      <button className="workflow-back" onClick={() => nav(-1)}>Back</button>
    </div>
  );
}

export default Workflow;