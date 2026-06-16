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
import FormProcess from "./pages/FormProcess";
import Workflow from "./pages/Workflow";
import EvmManagement from "./pages/CandidateSet";
import EvmMenu from "./pages/EvmMenu";
import FinalPollingMachine from "./pages/FinalPollingMachine";
import ReceptionTable from "./pages/ReceptionTable";
import DocumentCheck from "./pages/DocumentCheck";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/SK-Infotech" element={<Login />} />
        <Route path="/SK-Infotech/teamlead" element={<Lead />} />
        <Route path="/SK-Infotech/employee" element={<Employee />} />
        <Route path="/SK-Infotech/userManagement" element={<UserManagement />} />
        <Route path="/SK-Infotech/tasks" element={<Task />} />
        <Route path="/SK-Infotech/dashboard" element={<Dashboard />} />
        <Route path="/SK-Infotech/admin" element={<Admin />} />
        <Route path="/SK-Infotech/tracking" element={<Tracking />} />
        <Route path="/SK-Infotech/employee-task" element={<EmployeeTask />} />
        <Route path="/SK-Infotech/help" element={<Help />} />
        <Route path="/SK-Infotech/formprocess" element={<FormProcess />} />
        <Route path="/SK-Infotech/workflow" element={<Workflow />} />
        <Route path="/SK-Infotech/evmManagement" element={<EvmManagement />} />
        <Route path="/SK-Infotech/evmMenu" element={<EvmMenu />} />
        <Route path="/SK-Infotech/finalPollingMachine" element={<FinalPollingMachine />} />
        <Route path="/SK-Infotech/receptionTable" element={<ReceptionTable />} />
        <Route path="/SK-Infotech/receptionTable/documentCheck" element={<DocumentCheck />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;