import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
// 1. IMPORT YOUR THRESHOLDS
import { VEHICLE_THRESHOLDS } from '../config/thresholds';

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

  // --- SUSTAINABILITY: COOLDOWN TRACKER ---
  // Stores timestamps of sent alerts to prevent spamming
  // Structure: { "V-101_TEMP": 1709234567890, "V-103_SPEED": ... }
  const alertCooldowns = useRef({}); 
  const COOLDOWN_MINUTES = 15; // How long to wait before repeating an alert

  // --- HELPER: REALTIME UPDATER ---
  const handleRealtimePayload = (currentArray, payload) => {
    if (payload.eventType === 'INSERT') return [payload.new, ...currentArray];
    if (payload.eventType === 'UPDATE') return currentArray.map(item => item.id === payload.new.id ? payload.new : item);
    if (payload.eventType === 'DELETE') return currentArray.filter(item => item.id !== payload.old.id);
    return currentArray;
  };

  // --- 1. INITIAL FETCH & LIVE LISTENER ---
  useEffect(() => {
    fetchAllData();
    checkMaintenanceSchedules(); // Run once on load

    const dbChannel = supabase
      .channel('global-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' }, 
        (payload) => {
          
          if (payload.table === 'vehicles') {
            setVehicles(prev => handleRealtimePayload(prev, payload));
            
            // 🔥 AUTOMATION TRIGGER: Check for critical values instantly
            if (payload.eventType === 'UPDATE') {
              checkVehicleHealth(payload.new);
            }

          } else if (payload.table === 'alerts') {
            setAlerts(prev => handleRealtimePayload(prev, payload));
          } else if (payload.table === 'jobs') {
            setJobs(prev => handleRealtimePayload(prev, payload));
          } else if (payload.table === 'dtcs') {
            setDtcs(prev => handleRealtimePayload(prev, payload));
          } else if (payload.table === 'drivers') {
            setDrivers(prev => handleRealtimePayload(prev, payload));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dbChannel);
    };
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

  // --- 🔥 AUTOMATED ALERT LOGIC ---
  const checkVehicleHealth = async (vehicle) => {
    const T = VEHICLE_THRESHOLDS;
    const newAlerts = [];

    // 1. ENGINE TEMP CHECK
    if (vehicle.temp >= T.TEMP.WARNING) {
      const type = vehicle.temp >= T.TEMP.CRITICAL ? 'Critical' : 'Warning';
      const msg = `High Engine Temperature: ${vehicle.temp}°C`;
      if (shouldSendAlert(vehicle.id, 'TEMP', msg)) {
        newAlerts.push(createAlertObj(vehicle.id, msg, type));
      }
    }

    // 2. SPEED CHECK
    if (vehicle.speed >= T.SPEED.WARNING) {
      const msg = `Speeding Detected: ${vehicle.speed} km/h`;
      // We assume speeding is always a 'Warning' unless extreme, can adjust logic
      if (shouldSendAlert(vehicle.id, 'SPEED', msg)) {
        newAlerts.push(createAlertObj(vehicle.id, msg, 'Warning'));
      }
    }

    // 3. BATTERY CHECK
    if (vehicle.battery <= T.BATTERY.LOW) {
      const msg = `Low Battery Voltage: ${vehicle.battery}V`;
      if (shouldSendAlert(vehicle.id, 'BATTERY', msg)) {
        newAlerts.push(createAlertObj(vehicle.id, msg, 'Warning'));
      }
    }

    // 4. FUEL CHECK
    if (vehicle.fuel <= T.FUEL.LOW) {
      const type = vehicle.fuel <= T.FUEL.CRITICAL ? 'Critical' : 'Warning';
      const msg = `Low Fuel Level: ${vehicle.fuel}%`;
      if (shouldSendAlert(vehicle.id, 'FUEL', msg)) {
        newAlerts.push(createAlertObj(vehicle.id, msg, type));
      }
    }

    // 5. MIL (Check Engine Light)
    // Checks if MIL is true, 'ON', 'on', or 1
    const isMilOn = T.MIL.TRIGGER_VALUES.includes(vehicle.mil);
    if (isMilOn) {
      const msg = "Check Engine Light (MIL) Triggered";
      if (shouldSendAlert(vehicle.id, 'MIL', msg)) {
        newAlerts.push(createAlertObj(vehicle.id, msg, 'Critical'));
      }
    }

    // 6. BATCH INSERT ALERTS
    if (newAlerts.length > 0) {
      console.log("🚨 GENERATING AUTOMATED ALERTS:", newAlerts);
      await supabase.from('alerts').insert(newAlerts);
      // Note: We don't update state here because the Realtime Listener 
      // above will catch the INSERT event and update the UI automatically.
    }
  };

  // --- HELPER: SUSTAINABILITY CHECK ---
  const shouldSendAlert = (vehicleId, issueType, message) => {
    const key = `${vehicleId}_${issueType}`;
    const now = Date.now();
    const lastSent = alertCooldowns.current[key];

    // If never sent, OR sent more than X minutes ago -> Send it
    if (!lastSent || (now - lastSent) > (COOLDOWN_MINUTES * 60 * 1000)) {
      alertCooldowns.current[key] = now; // Update timestamp
      return true;
    }
    return false; // Suppress alert (Too soon)
  };

  const createAlertObj = (vehicleId, message, type) => ({
    vehicle: vehicleId,
    message: message,
    type: type, // 'Warning' (Yellow) or 'Critical' (Red)
    status: 'Unread',
    created_at: new Date().toISOString()
  });

  // --- 2. ACTIONS (Job, Note, Drivers etc) ---
  const addNewJob = async (jobData) => {
    const tempId = `TEMP-${Date.now()}`;
    const newJob = { ...jobData, id: tempId, status: 'Pending', created_at: new Date().toISOString() };
    setJobs([newJob, ...jobs]);
    const { data } = await supabase.from('jobs').insert([jobData]).select();
    if (data) setJobs(prev => prev.map(j => j.id === tempId ? data[0] : j));
  };

  const startJob = async (id) => await supabase.from('jobs').update({ status: 'In Progress' }).eq('id', id);
  const completeJob = async (id) => await supabase.from('jobs').update({ status: 'Completed' }).eq('id', id);
  
  const addNote = async (noteData) => {
    const { data } = await supabase.from('notes').insert([noteData]).select();
    if (data) setNotes([data[0], ...notes]);
  };

  const assignDriver = async (driverId, vehicleId) => await supabase.from('drivers').update({ vehicle: vehicleId }).eq('id', driverId);
  const unassignDriver = async (driverId) => await supabase.from('drivers').update({ vehicle: 'Not assigned' }).eq('id', driverId);

  const markAlertRead = async (id) => await supabase.from('alerts').update({ status: 'Read' }).eq('id', id);
  const markAllAlertsRead = async () => await supabase.from('alerts').update({ status: 'Read' }).neq('status', 'Read');
  const deleteAlert = async (id) => await supabase.from('alerts').delete().eq('id', id);
  const resolveDTC = async (id) => await supabase.from('dtcs').delete().eq('id', id);

  // --- CALCULATED STATS ---
  const stats = {
    activeJobs: jobs.filter(j => j.status === 'In Progress').length,
    pendingJobs: jobs.filter(j => j.status === 'Pending').length,
    activeDTCs: dtcs.filter(d => d.status === 'Active').length,
    activeAlerts: alerts.filter(a => a.status === 'Unread').length,
    fleetHealth: Math.max(0, 100 - (dtcs.length * 5)), 
    availableVehicles: vehicles.filter(v => v.status === 'Normal' || v.status === 'Idle').length 
  };

  // --- AUTOMATION: MAINTENANCE SCHEDULE ---
  const checkMaintenanceSchedules = async () => {
    try {
      const { data: schedules } = await supabase.from('maintenance_schedules').select('*').lte('next_due_date', new Date().toISOString());
      if (!schedules?.length) return;

      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 30); // Look back 30 days
      const { data: existingAlerts } = await supabase.from('alerts').select('vehicle, message').gte('created_at', recentDate.toISOString());

      const newAlerts = schedules.filter(sch => {
          const alertMsg = `Routine Maintenance Due: ${sch.service_type}`;
          return !existingAlerts.find(a => a.vehicle === sch.vehicle_id && a.message === alertMsg);
        }).map(sch => ({
          type: 'Info', 
          status: 'Unread',
          message: `Routine Maintenance Due: ${sch.service_type}`,
          vehicle: sch.vehicle_id,
          created_at: new Date().toISOString()
        }));

      if (newAlerts.length > 0) await supabase.from('alerts').insert(newAlerts);
    } catch (err) { console.error("Auto-Maintenance Check Failed:", err); }
  };

  return (
    <JobContext.Provider value={{
      jobs, vehicles, drivers, notes, dtcs, alerts, loading, stats,
      addNewJob, startJob, completeJob, addNote, assignDriver, unassignDriver, resolveDTC, markAlertRead, markAllAlertsRead, deleteAlert
    }}>
      {children}
    </JobContext.Provider>
  );
};