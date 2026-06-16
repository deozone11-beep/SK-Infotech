import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Lead from "./pages/Lead";
import Employee from "./pages/Employee";
import UserManagement from "./pages/UserManagement";
import Task from "./pages/Task";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Tracking from "./pages/Tracking";
import EmployeeTask from "./pages/EmployeeTask";
import Help from "./pages/Help";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/teamlead" element={<Lead />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="/userManagement" element={<UserManagement />} />
        <Route path="/tasks" element={<Task />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/employee-task" element={<EmployeeTask />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;