import React, { createContext, useContext, useState, useEffect } from 'react';

const JobContext = createContext();

// --- 1. INITIAL MOCK DATA ---
const INITIAL_JOBS = [
  { id: 'J-2401', vehicle: 'V-101', plate: 'ABC 1234', type: 'Urgent', priority: 'High', status: 'Pending', date: '1/24/2026', desc: 'Check Engine Light - P0171' },
  { id: 'J-2402', vehicle: 'V-103', plate: 'DEF 5678', type: 'Routine', priority: 'Medium', status: 'In Progress', date: '1/24/2026', desc: 'Bi-weekly preventive maintenance' },
  { id: 'J-2405', vehicle: 'V-109', plate: 'MNO 7890', type: 'Urgent', priority: 'High', status: 'Completed', date: '1/23/2026', desc: 'Transmission slipping investigation' },
  { id: 'J-2406', vehicle: 'V-102', plate: 'PQR 2468', type: 'Routine', priority: 'Low', status: 'Pending', date: '1/25/2026', desc: 'Tire rotation and pressure check' }
];

const INITIAL_VEHICLES = [
  { id: 'JPN-001', plate: 'ABC-1234', status: 'Normal', mil: 'OFF', lat: 14.5995, lng: 120.9842, address: 'Quezon Ave, QC', speed: 45, temp: 88, avail: 'Available', lastUpdate: '2 mins ago' },
  { id: 'JPN-002', plate: 'DEF 5678', status: 'Warning', mil: 'ON', lat: 14.6091, lng: 121.0223, address: 'EDSA, Cubao', speed: 22, temp: 95, avail: 'Available', lastUpdate: '5 mins ago' },
  { id: 'JPN-003', plate: 'GHI-9012', status: 'Critical', mil: 'ON', lat: 14.5764, lng: 120.9819, address: 'Taft Ave, Manila', speed: 0, temp: 105, avail: 'Under Maintenance', lastUpdate: '1 min ago', dtcCodes: [{code:'P0171', severity:'Critical', desc:'System Too Lean'}] },
  { id: 'JPN-004', plate: 'JKL-3456', status: 'Normal', mil: 'OFF', lat: 14.5547, lng: 121.0244, address: 'Ayala Ave, Makati', speed: 32, temp: 90, avail: 'Available', lastUpdate: '3 mins ago' },
  { id: 'JPN-005', plate: 'MNO-7890', status: 'Warning', mil: 'OFF', lat: 14.5836, lng: 121.0583, address: 'Ortigas, Pasig', speed: 15, temp: 98, avail: 'Available', lastUpdate: 'Now', dtcCodes: [{code:'P0420', severity:'Warning', desc:'Catalyst Efficiency'}] },
  { id: 'JPN-006', plate: 'PQR-2468', status: 'Normal', mil: 'OFF', lat: 14.6042, lng: 121.0368, address: 'Aurora Blvd, QC', speed: 28, temp: 89, avail: 'Available', lastUpdate: '1 min ago' },
];

const INITIAL_DRIVERS = [
  { id: 'DRV-001', name: 'Roberto Tan', license: 'N01-12-345678', vehicle: 'JPN-001', status: 'Active', trips: 3 },
  { id: 'DRV-002', name: 'Carmen Lopez', license: 'N01-13-876543', vehicle: 'JPN-002', status: 'Idle', trips: 2 },
  { id: 'DRV-003', name: 'Miguel Fernandez', license: 'N01-14-234567', vehicle: 'JPN-004', status: 'Active', trips: 4 },
  { id: 'DRV-004', name: 'Sofia Ramirez', license: 'N01-15-765432', vehicle: 'Not assigned', status: 'Idle', trips: 0 },
  { id: 'DRV-005', name: 'Luis Mendoza', license: 'N01-16-987654', vehicle: 'JPN-006', status: 'Completed', trips: 5 },
];

const INITIAL_ALERTS = [
  { id: 1, type: 'Critical', vehicle: 'JPN-003', message: 'Engine Overheating (105°C) detected', time: '10 mins ago', status: 'Unread' },
  { id: 2, type: 'Warning', vehicle: 'JPN-005', message: 'DTC P0420: Catalyst System Efficiency Below Threshold', time: '25 mins ago', status: 'Unread' },
  { id: 3, type: 'Critical', vehicle: 'JPN-001', message: 'Impact detected: Possible collision', time: '1 hour ago', status: 'Unread' },
];

const INITIAL_DTCS = [
  { id: 'D-001', code: 'P0171', vehicle: 'V-101', plate: 'ABC 1234', desc: 'System Too Lean (Bank 1)', severity: 'Critical', timestamp: '2026-01-24 09:15', status: 'Active' },
  { id: 'D-002', code: 'P0420', vehicle: 'V-101', plate: 'ABC 1234', desc: 'Catalyst System Efficiency Below Threshold', severity: 'Warning', timestamp: '2026-01-24 09:15', status: 'Active' },
];

const INITIAL_NOTES = [
  { id: 1, jobId: 'J-2402', vehicle: 'V-103', type: 'Inspection', content: 'Routine oil change completed.', tech: 'Juan dela Cruz', time: '2026-01-24 09:30' }
];

// Helper to load from Storage
const getSavedData = (key, fallback) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
};

export const JobProvider = ({ children }) => {
  // --- 2. STATE ---
  const [jobs, setJobs] = useState(() => getSavedData('bantay_jobs', INITIAL_JOBS));
  const [vehicles, setVehicles] = useState(() => getSavedData('bantay_vehicles', INITIAL_VEHICLES));
  const [drivers, setDrivers] = useState(() => getSavedData('bantay_drivers', INITIAL_DRIVERS));
  const [alerts, setAlerts] = useState(() => getSavedData('bantay_alerts', INITIAL_ALERTS));
  const [dtcs, setDtcs] = useState(() => getSavedData('bantay_dtcs', INITIAL_DTCS));
  const [notes, setNotes] = useState(() => getSavedData('bantay_notes', INITIAL_NOTES));
  
  // NEW: Toast State
  const [toast, setToast] = useState(null);

  // --- 3. PERSISTENCE ---
  useEffect(() => { localStorage.setItem('bantay_jobs', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem('bantay_vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('bantay_drivers', JSON.stringify(drivers)); }, [drivers]);
  useEffect(() => { localStorage.setItem('bantay_alerts', JSON.stringify(alerts)); }, [alerts]);
  useEffect(() => { localStorage.setItem('bantay_dtcs', JSON.stringify(dtcs)); }, [dtcs]);
  useEffect(() => { localStorage.setItem('bantay_notes', JSON.stringify(notes)); }, [notes]);

  // --- 4. TOAST HELPER ---
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // --- 5. ACTIONS ---
  
  // Jobs
  const startJob = (id) => {
    setJobs(c => c.map(j => j.id === id ? { ...j, status: 'In Progress' } : j));
    showToast('Job started', 'success');
  };

  const completeJob = (id) => {
    setJobs(c => c.map(j => j.id === id ? { ...j, status: 'Completed' } : j));
    showToast('Job marked as completed', 'success');
  };

  const addNewJob = (data) => {
    setJobs(p => [{ id: `J-${Math.floor(Math.random() * 10000)}`, status: 'Pending', date: new Date().toLocaleDateString(), ...data }, ...p]);
    showToast('New maintenance job created successfully', 'success');
  };

  // Drivers
  const unassignDriver = (driverId) => {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, vehicle: 'Not assigned', status: 'Idle' } : d));
    showToast('Driver unassigned successfully', 'success'); // Using 'success' (green) or you can use 'error' (red) for removal
  };

  const assignDriver = (driverId, vehicleId) => {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, vehicle: vehicleId, status: 'Active' } : d));
    showToast(`Vehicle ${vehicleId} assigned to driver`, 'success');
  };

  // Alerts
  const markAlertRead = (id) => setAlerts(c => c.map(a => a.id === id ? { ...a, status: 'Read' } : a));
  const deleteAlert = (id) => setAlerts(c => c.filter(a => a.id !== id));
  const markAllAlertsRead = () => {
    setAlerts(c => c.map(a => ({ ...a, status: 'Read' })));
    showToast('All alerts marked as read', 'success');
  };

  // Misc
  const resolveDTC = (id) => {
    setDtcs(c => c.map(d => d.id === id ? { ...d, status: 'Resolved' } : d));
    showToast('DTC issue marked as resolved', 'success');
  };

  const addNote = (note) => {
    setNotes(c => [{ id: Date.now(), tech: 'Juan dela Cruz', time: new Date().toLocaleString(), ...note }, ...c]);
    showToast('Note added to job record', 'success');
  };

  // --- 6. STATS ---
  const stats = {
    total: jobs.length,
    inProgress: jobs.filter(j => j.status === 'In Progress').length,
    completed: jobs.filter(j => j.status === 'Completed').length,
    pending: jobs.filter(j => j.status === 'Pending').length,
    critical: jobs.filter(j => j.type === 'Urgent' && j.status !== 'Completed').length,
    activeDTCs: dtcs.filter(d => d.status === 'Active').length,
    activeVehicles: vehicles.length,
    criticalVehicles: vehicles.filter(v => v.status === 'Critical').length,
    unreadAlerts: alerts.filter(a => a.status === 'Unread').length
  };

  return (
    <JobContext.Provider value={{ 
      jobs, vehicles, drivers, alerts, dtcs, notes, stats, toast, // <--- Export toast
      setToast, showToast, // <--- Export helpers
      startJob, completeJob, addNewJob,
      unassignDriver, assignDriver,
      markAlertRead, deleteAlert, markAllAlertsRead,
      resolveDTC, addNote
    }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => useContext(JobContext);