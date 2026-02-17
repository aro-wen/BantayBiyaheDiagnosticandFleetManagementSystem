import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const JobContext = createContext();

export const useJobs = () => useContext(JobContext);

export const JobProvider = ({ children }) => {
  // --- STATE ---
  const [jobs, setJobs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [dtcs, setDtcs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. INITIAL FETCH ---
  useEffect(() => {
    fetchAllData();

    // 🔥 RUN THE CHECK AUTOMATICALLY
    checkMaintenanceSchedules();

    // Optional: Set up Realtime Subscriptions here if needed
    // const channel = supabase.channel('db-changes')...
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [jobsData, vehiclesData, driversData, notesData, dtcsData, alertsData] = await Promise.all([
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
        supabase.from('vehicles').select('*').order('id', { ascending: true }),
        supabase.from('drivers').select('*').order('name', { ascending: true }),
        supabase.from('notes').select('*').order('created_at', { ascending: false }),
        supabase.from('dtcs').select('*').order('created_at', { ascending: false }),
        supabase.from('alerts').select('*').order('created_at', { ascending: false }),
      ]);

      if (jobsData.data) setJobs(jobsData.data);
      if (vehiclesData.data) setVehicles(vehiclesData.data);
      if (driversData.data) setDrivers(driversData.data);
      if (notesData.data) setNotes(notesData.data);
      if (dtcsData.data) setDtcs(dtcsData.data);
      if (alertsData.data) setAlerts(alertsData.data);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. JOB ACTIONS ---
  const addNewJob = async (jobData) => {
    // Optimistic Update
    const tempId = `TEMP-${Date.now()}`;
    const newJob = { ...jobData, id: tempId, status: 'Pending', created_at: new Date().toISOString() };
    setJobs([newJob, ...jobs]);

    const { data, error } = await supabase.from('jobs').insert([jobData]).select();
    if (data) {
      // Replace temp job with real one
      setJobs(prev => prev.map(j => j.id === tempId ? data[0] : j));
    }
    if (error) console.error("Error adding job:", error);
  };

  const startJob = async (id) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status: 'In Progress' } : j));
    await supabase.from('jobs').update({ status: 'In Progress' }).eq('id', id);
  };

  const completeJob = async (id) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status: 'Completed' } : j));
    await supabase.from('jobs').update({ status: 'Completed' }).eq('id', id);
  };

  // --- 3. NOTE ACTIONS ---
  const addNote = async (noteData) => {
    const tempNote = { ...noteData, id: Math.random(), created_at: new Date().toISOString() };
    setNotes([tempNote, ...notes]);

    const { data, error } = await supabase.from('notes').insert([noteData]).select();
    if (data) {
       setNotes(prev => prev.map(n => n.id === tempNote.id ? data[0] : n));
    }
  };

  // --- 4. DRIVER ACTIONS ---
  const assignDriver = async (driverId, vehicleId) => {
    // 1. Optimistic Update: Update Driver List
    setDrivers(prev => prev.map(d => 
      d.id === driverId ? { ...d, vehicle: vehicleId } : d
    ));

    // 2. Optimistic Update: Update Vehicle Status to 'Active'
    setVehicles(prev => prev.map(v => 
      v.id === vehicleId ? { ...v, status: 'Active' } : v
    ));

    // 3. Database Updates
    await supabase.from('drivers').update({ vehicle: vehicleId }).eq('id', driverId);
    // Optional: If you track vehicle status in DB
    // await supabase.from('vehicles').update({ status: 'Active' }).eq('id', vehicleId);
  };

  const unassignDriver = async (driverId) => {
    // 1. Find which vehicle was assigned (to set it back to Idle if needed)
    const driver = drivers.find(d => d.id === driverId);
    const vehicleId = driver?.vehicle;

    // 2. Optimistic Update
    setDrivers(prev => prev.map(d => 
      d.id === driverId ? { ...d, vehicle: 'Not assigned' } : d
    ));
    
    // 3. Database Update
    await supabase.from('drivers').update({ vehicle: 'Not assigned' }).eq('id', driverId);
  };

  // --- 5. ALERT ACTIONS ---
  const markAlertRead = async (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Read' } : a));
    await supabase.from('alerts').update({ status: 'Read' }).eq('id', id);
  };

  const markAllAlertsRead = async () => {
    setAlerts(prev => prev.map(a => ({ ...a, status: 'Read' })));
    await supabase.from('alerts').update({ status: 'Read' }).neq('status', 'Read');
  };

  const deleteAlert = async (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    await supabase.from('alerts').delete().eq('id', id);
  };

  // --- 6. DTC ACTIONS ---
  const resolveDTC = async (id) => {
    // Option A: Delete it
    setDtcs(prev => prev.filter(d => d.id !== id));
    await supabase.from('dtcs').delete().eq('id', id);

    // Option B: Mark as Resolved (if you prefer keeping history)
    // setDtcs(prev => prev.map(d => d.id === id ? { ...d, status: 'Resolved' } : d));
    // await supabase.from('dtcs').update({ status: 'Resolved' }).eq('id', id);
  };

  // --- 7. CALCULATED STATS ---
  const stats = {
    activeJobs: jobs.filter(j => j.status === 'In Progress').length,
    pendingJobs: jobs.filter(j => j.status === 'Pending').length,
    activeDTCs: dtcs.filter(d => d.status === 'Active').length,
    activeAlerts: alerts.filter(a => a.status === 'Unread').length,
    fleetHealth: Math.max(0, 100 - (dtcs.length * 5)), // Simple mock calculation
    availableVehicles: vehicles.filter(v => v.status === 'Normal' || v.status === 'Idle').length // Depending on your status logic
  };

  // --- AUTOMATION: CHECK ROUTINE MAINTENANCE ---
  const checkMaintenanceSchedules = async () => {
    try {
      // A. Get schedules that are due TODAY or BEFORE (Overdue)
      const { data: schedules, error } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .lte('next_due_date', new Date().toISOString());

      if (error || !schedules?.length) return;

      // B. Get existing unread alerts to prevent duplicates
      const { data: existingAlerts } = await supabase
        .from('alerts')
        .select('vehicle, message')
        .eq('status', 'Unread');

      // C. Filter: Create alert ONLY if it doesn't exist yet
      const newAlerts = schedules
        .filter(sch => {
          const alertMsg = `Routine Maintenance Due: ${sch.service_type}`;
          // Check if we already alerted this vehicle for this specific service
          const exists = existingAlerts.find(
            a => a.vehicle === sch.vehicle_id && a.message === alertMsg
          );
          return !exists;
        })
        .map(sch => ({
          type: 'Info', // Blue alert
          status: 'Unread',
          message: `Routine Maintenance Due: ${sch.service_type}`,
          vehicle: sch.vehicle_id,
          created_at: new Date().toISOString()
        }));

      // D. Insert new alerts into Supabase
      if (newAlerts.length > 0) {
        await supabase.from('alerts').insert(newAlerts);
        // Refresh local state to show the blue badge immediately
        const { data: freshAlerts } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
        if (freshAlerts) setAlerts(freshAlerts);
      }
    } catch (err) {
      console.error("Auto-Maintenance Check Failed:", err);
    }
  };

  return (
    <JobContext.Provider value={{
      // State
      jobs,
      vehicles,
      drivers,
      notes,
      dtcs,
      alerts,
      loading,
      stats,

      // Actions
      addNewJob,
      startJob,
      completeJob,
      addNote,
      assignDriver,
      unassignDriver,
      resolveDTC,
      markAlertRead,
      markAllAlertsRead,
      deleteAlert
    }}>
      {children}
    </JobContext.Provider>
  );
};