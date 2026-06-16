import { useState } from "react";
import { users, projects } from "../data/data";
import { getTasks, saveTasks } from "../utils/storage";

function TaskModal({ close, refresh }) {
  const [empId, setEmpId] = useState("");
  const [taskName, setTaskName] = useState("");
  const [project, setProject] = useState("");

  const handleSubmit = () => {
    const user = users.find(u => u.id === empId);

    const tasks = getTasks();

    const newTask = {
      empId,
      empName: user?.name,
      project,
      task: taskName,
      status: "Pending"
    };

    tasks.push(newTask);
    saveTasks(tasks);

    alert("Task Assigned Successfully");

    refresh();
    close();
  };

  return (
    <div>
      <h3>Create Task</h3>

      <select onChange={(e)=>setEmpId(e.target.value)}>
        <option>Select Employee</option>
        {users.filter(u=>u.role==="employee").map(u=>(
          <option key={u.id} value={u.id}>{u.id}</option>
        ))}
      </select>

      <br />

      <select onChange={(e)=>setProject(e.target.value)}>
        <option>Select Project</option>
        {projects.map((p,i)=>(
          <option key={i}>{p}</option>
        ))}
      </select>

      <br />

      <input placeholder="Task Name" onChange={(e)=>setTaskName(e.target.value)} />

      <br />

      <button onClick={handleSubmit}>Submit</button>
      <button onClick={close}>Close</button>
    </div>
  );
}

export default TaskModal;