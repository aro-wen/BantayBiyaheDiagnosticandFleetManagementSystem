import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
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

  // --- SUSTAINABILITY & RECURSION CONTROL ---
  const alertCooldowns = useRef({});
  // 🔥 GATEKEEPER: Prevents infinite loops by tracking the last processed state of each vehicle
  const lastProcessedFingerprint = useRef({}); 
  const COOLDOWN_MINUTES = 15;

  // --- HELPER: REALTIME UPDATER (Deduplicated) ---
  const handleRealtimePayload = (currentArray, payload) => {
    if (payload.eventType === 'INSERT') {
      const exists = currentArray.some(item => String(item.id) === String(payload.new.id));
      return exists ? currentArray : [payload.new, ...currentArray];
    }
    if (payload.eventType === 'UPDATE') {
      return currentArray.map(item => String(item.id) === String(payload.new.id) ? payload.new : item);
    }
    if (payload.eventType === 'DELETE') {
      return currentArray.filter(item => String(item.id) !== String(payload.old.id));
    }
    return currentArray;
  };

  // --- 1. INITIAL FETCH & LIVE LISTENER ---
  useEffect(() => {
    fetchAllData();
    checkMaintenanceSchedules();

    const dbChannel = supabase
      .channel('global-fleet-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          const { table, eventType, new: newRow } = payload;

          if (table === 'vehicles') {
            setVehicles(prev => handleRealtimePayload(prev, payload));
            // Trigger health check only on updates to avoid loop on initial insert
            if (eventType === 'UPDATE') checkVehicleHealth(newRow);
          } 
          else if (table === 'alerts') setAlerts(prev => handleRealtimePayload(prev, payload));
          else if (table === 'jobs' || table === 'maintenance_tasks') setJobs(prev => handleRealtimePayload(prev, payload));
          else if (table === 'dtcs') setDtcs(prev => handleRealtimePayload(prev, payload));
          else if (table === 'drivers') setDrivers(prev => handleRealtimePayload(prev, payload));
          else if (table === 'notes' || table === 'maintenance_notes') setNotes(prev => handleRealtimePayload(prev, payload));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log("📡 Realtime Fleet Sync Active");
      });

    return () => supabase.removeChannel(dbChannel);
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
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 🔥 AUTOMATED ALERT LOGIC (LOOP PROTECTED) ---
  const checkVehicleHealth = async (vehicle) => {
    // 1. Create unique fingerprint of critical values
    const fingerprint = `${vehicle.id}-${vehicle.temp}-${vehicle.speed}-${vehicle.battery}-${vehicle.fuel}-${vehicle.mil}`;
    
    // 2. EXIT if this exact data state was already processed (Stops 502/Loop)
    if (lastProcessedFingerprint.current[vehicle.id] === fingerprint) return;
    lastProcessedFingerprint.current[vehicle.id] = fingerprint;

    const T = VEHICLE_THRESHOLDS;
    const newAlerts = [];
    const isIdling = (vehicle.speed || 0) <= 5;

    // Engine Temp
    if (vehicle.temp >= T.TEMP.WARNING) {
      const type = vehicle.temp >= T.TEMP.CRITICAL ? 'Critical' : 'Warning';
      const msg = `High Engine Temp: ${vehicle.temp}°C`;
      if (shouldSendAlert(vehicle.id, 'TEMP', msg)) newAlerts.push(createAlertObj(vehicle.id, msg, type, 'Diagnostic'));
    }

    // Speeding
    if (vehicle.speed >= T.SPEED.WARNING) {
      const type = vehicle.speed >= T.SPEED.MAX ? 'Critical' : 'Warning';
      const msg = `Speeding: ${vehicle.speed} km/h`;
      if (shouldSendAlert(vehicle.id, 'SPEED', msg)) newAlerts.push(createAlertObj(vehicle.id, msg, type, 'Behavior'));
    }

    // Battery
    if (vehicle.battery <= T.BATTERY.WARNING_LOW) {
      const type = vehicle.battery <= T.BATTERY.CRITICAL_LOW ? 'Critical' : 'Warning';
      const msg = `Battery Voltage: ${vehicle.battery}V`;
      if (shouldSendAlert(vehicle.id, 'BATTERY', msg)) newAlerts.push(createAlertObj(vehicle.id, msg, type, 'Diagnostic'));
    }

    // Fuel Consumption (Speed-Aware)
    if (isIdling) {
      if (vehicle.fuel >= T.FUEL.IDLING.WARNING) {
        const type = vehicle.fuel >= T.FUEL.IDLING.CRITICAL ? 'Critical' : 'Warning';
        const msg = `High Idle Consumption: ${(vehicle.fuel || 0).toFixed(1)} L/h`;
        if (shouldSendAlert(vehicle.id, 'FUEL', msg)) newAlerts.push(createAlertObj(vehicle.id, msg, type, 'Diagnostic'));
      }
    } else {
      if (vehicle.fuel <= T.FUEL.MOVING.WARNING) {
        const type = vehicle.fuel <= T.FUEL.MOVING.CRITICAL ? 'Critical' : 'Warning';
        const msg = `Low Efficiency: ${(vehicle.fuel || 0).toFixed(1)} km/L`;
        if (shouldSendAlert(vehicle.id, 'FUEL', msg)) newAlerts.push(createAlertObj(vehicle.id, msg, type, 'Diagnostic'));
      }
    }

    // MIL Status
    if (T.MIL.TRIGGER_VALUES.includes(vehicle.mil)) {
      const msg = "Check Engine Light (MIL) Active";
      if (shouldSendAlert(vehicle.id, 'MIL', msg)) newAlerts.push(createAlertObj(vehicle.id, msg, 'Critical', 'Diagnostic'));
    }

    if (newAlerts.length > 0) {
      const { error } = await supabase.from('alerts').insert(newAlerts);
      if (error) console.error("Alert Insert Error:", error);
    }
  };

  const shouldSendAlert = (vehicleId, issueType, message) => {
    const key = `${vehicleId}_${issueType}`;
    const now = Date.now();
    const lastSent = alertCooldowns.current[key];
    if (!lastSent || (now - lastSent) > (COOLDOWN_MINUTES * 60 * 1000)) {
      alertCooldowns.current[key] = now;
      return true;
    }
    return false;
  };

  const createAlertObj = (vehicleId, message, type, category = 'Maintenance') => ({
    vehicle: vehicleId,
    message,
    type,
    category,
    status: 'Unread',
    created_at: new Date().toISOString()
  });

  // --- ACTIONS ---
  const addNewJob = async (jobData) => {
    const { data, error } = await supabase.from('jobs').insert([jobData]).select();
    // Note: handleRealtimePayload will add the job to the UI automatically
    if (error) console.error("Job Creation Error:", error);
  };

  const startJob = async (id) => {
    await supabase.from('jobs').update({ status: 'In Progress' }).eq('id', id);
  };

  const completeJob = async (id) => {
    await supabase.from('jobs').update({ status: 'Completed' }).eq('id', id);
  };
  
  const addNote = async (noteData) => {
    await supabase.from('notes').insert([noteData]);
  };

  const assignDriver = async (driverId, vehicleId) => await supabase.from('drivers').update({ vehicle: vehicleId }).eq('id', driverId);
  const unassignDriver = async (driverId) => await supabase.from('drivers').update({ vehicle: 'Not assigned' }).eq('id', driverId);
  const markAlertRead = async (id) => await supabase.from('alerts').update({ status: 'Read' }).eq('id', id);
  const markAllAlertsRead = async () => await supabase.from('alerts').update({ status: 'Read' }).neq('status', 'Read');
  const deleteAlert = async (id) => await supabase.from('alerts').delete().eq('id', id);
  const resolveDTC = async (id) => await supabase.from('dtcs').delete().eq('id', id);

  const stats = {
    activeJobs: jobs.filter(j => j.status === 'In Progress').length,
    pendingJobs: jobs.filter(j => j.status === 'Pending').length,
    activeDTCs: dtcs.filter(d => d.status === 'Active').length,
    activeAlerts: alerts.filter(a => a.status === 'Unread').length,
    fleetHealth: Math.max(0, 100 - (dtcs.length * 5)), 
    availableVehicles: vehicles.filter(v => v.status === 'Normal' || v.status === 'Idle').length 
  };

  const checkMaintenanceSchedules = async () => {
    try {
      const { data: schedules } = await supabase.from('maintenance_schedules').select('*').lte('next_due_date', new Date().toISOString());
      if (!schedules?.length) return;
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 30);
      const { data: existingAlerts } = await supabase.from('alerts').select('vehicle, message').gte('created_at', recentDate.toISOString());

      const newAlerts = schedules.filter(sch => {
          const alertMsg = `Routine Maintenance Due: ${sch.service_type}`;
          return !existingAlerts.find(a => a.vehicle === sch.vehicle_id && a.message === alertMsg);
        }).map(sch => createAlertObj(sch.vehicle_id, `Routine Maintenance Due: ${sch.service_type}`, 'Info', 'Maintenance'));

      if (newAlerts.length > 0) await supabase.from('alerts').insert(newAlerts);
    } catch (err) { console.error("Auto-Maintenance Failed:", err); }
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