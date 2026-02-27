import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { JobProvider } from './contexts/JobContext';

// Layouts
import TechnicianLayout from './layouts/TechnicianLayout';
import DispatcherLayout from './layouts/DispatcherLayout';
import JobAssignment from './pages/dispatcher/JobAssignment';
import Login from './pages/Login';
// Technician Pages
import AssignedJobs from './pages/technician/AssignedJobs';
import JobDetails from './pages/technician/JobDetails';
import VehicleHealth from './pages/technician/VehicleHealth';
// import DTCs from './pages/technician/DTCs';
import History from './pages/technician/History';
import Notes from './pages/technician/Notes';


// Dispatcher Pages
import DispatcherDashboard from './pages/dispatcher/DispatcherDashboard';
import DispatcherVehicles from './pages/dispatcher/Vehicles';
import Drivers from './pages/dispatcher/Drivers';
import Alerts from './pages/dispatcher/Alerts';
// import MaintenanceSchedule from './pages/dispatcher/MaintenanceSchedule';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';

function App() {
  return (
    <BrowserRouter>
      <JobProvider>
        <Routes>
          {/* Root is now Login */}
          <Route path="/" element={<Login />} />
          {/* Default Redirect: Go to Technician Jobs by default */}
          <Route path="/" element={<Navigate to="/technician/jobs" replace />} />
          
          {/* --- TECHNICIAN PORTAL --- */}
          <Route path="/technician" element={<TechnicianLayout />}>
            <Route path="jobs" element={<AssignedJobs />} />
            <Route path="jobs/:id" element={<JobDetails />} />
            <Route path="health" element={<VehicleHealth />} />
            {/* <Route path="dtcs" element={<DTCs />} /> */}
            <Route path="history" element={<History />} />
            <Route path="notes" element={<Notes />} />
          </Route>

          {/* --- DISPATCHER PORTAL --- */}
          <Route path="/dispatcher" element={<DispatcherLayout />}>
            <Route path="dashboard" element={<DispatcherDashboard />} />
            <Route path="assign" element={<JobAssignment />} /> {/* <--- NEW */}
            {/* <Route path="schedule" element={<MaintenanceSchedule />} /> */}
            <Route path="vehicles" element={<DispatcherVehicles />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="alerts" element={<Alerts />} />
          </Route>
          {/* --- DRIVER PORTAL --- */}
          <Route path="/driver/dashboard" element={<DriverDashboard />} />

        </Routes>
      </JobProvider>
    </BrowserRouter>
  );
}

export default App;