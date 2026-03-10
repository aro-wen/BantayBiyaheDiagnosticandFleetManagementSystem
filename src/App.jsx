import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { JobProvider } from './contexts/JobContext';

// Layouts
import TechnicianLayout from './layouts/TechnicianLayout';
import DispatcherLayout from './layouts/DispatcherLayout';
import Login from './pages/Login';

// Technician Pages
import AssignedJobs from './pages/technician/AssignedJobs';
import JobDetails from './pages/technician/JobDetails';
import VehicleHealth from './pages/technician/VehicleHealth';
import TechnicianMileage from './pages/technician/TechnicianMileage';
import History from './pages/technician/History';
import Notes from './pages/technician/Notes';

// Dispatcher Pages
import DispatcherDashboard from './pages/dispatcher/DispatcherDashboard';
import JobAssignment from './pages/dispatcher/JobAssignment';
import DispatcherVehicles from './pages/dispatcher/Vehicles';
import Drivers from './pages/dispatcher/Drivers';
import Alerts from './pages/dispatcher/Alerts';
import MaintenanceSchedule from './pages/dispatcher/MaintenanceSchedule';
import MileageChecker from './pages/dispatcher/MileageChecker';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';

function App() {
  return (
    <BrowserRouter>
      <JobProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* --- TECHNICIAN PORTAL --- */}
          <Route path="/technician" element={<TechnicianLayout />}>
            <Route index element={<Navigate to="jobs" replace />} />
            <Route path="jobs" element={<AssignedJobs />} />
            <Route path="jobs/:id" element={<JobDetails />} />
            <Route path="health" element={<VehicleHealth />} />
            <Route path="technicianmileage" element={<TechnicianMileage />} />
            <Route path="history" element={<History />} />
            <Route path="notes" element={<Notes />} />
          </Route>

          {/* --- DISPATCHER PORTAL --- */}
          <Route path="/dispatcher" element={<DispatcherLayout />}>
            {/* 1. Set Vehicles as the default landing page for the portal */}
            <Route index element={<Navigate to="vehicles" replace />} />
            
            {/* 2. Update dashboard path to also redirect to vehicles if preferred */}
            <Route path="dashboard" element={<Navigate to="/dispatcher/vehicles" replace />} /> 
            
            <Route path="vehicles" element={<DispatcherVehicles />} />
            <Route path="assign" element={<JobAssignment />} />
            <Route path="schedule" element={<MaintenanceSchedule />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="mileage" element={<MileageChecker />} />
          </Route>

          {/* --- DRIVER PORTAL --- */}
          <Route path="/driver/dashboard" element={<DriverDashboard />} />

          {/* Catch-all 404 Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </JobProvider>
    </BrowserRouter>
  );
}

export default App;