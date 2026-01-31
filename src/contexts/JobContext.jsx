import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Import your client

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  // --- STATE (Initialize as empty arrays) ---
  const [jobs, setJobs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toast State
  const [toast, setToast] = useState(null);

  // --- HELPER: TOAST ---
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // --- 1. FETCH DATA (Load from Supabase on Mount) ---
  const fetchData = async () => {
    setLoading(true);
    
    const { data: jobsData } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    const { data: vehiclesData } = await supabase.from('vehicles').select('*');
    const { data: driversData } = await supabase.from('drivers').select('*');
    const { data: alertsData } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
    const { data: notesData } = await supabase.from('notes').select('*').order('created_at', { ascending: false });

    if (jobsData) setJobs(jobsData);
    if (vehiclesData) setVehicles(vehiclesData);
    if (driversData) setDrivers(driversData);
    if (alertsData) setAlerts(alertsData);
    if (notesData) setNotes(notesData);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    // --- REALTIME SUBSCRIPTION ---
    const subscription = supabase
      .channel('public:jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, (payload) => {
        console.log('Realtime update:', payload);
        
        // FIX: Check if we already have this ID before adding it
        if (payload.eventType === 'INSERT') {
          setJobs((prev) => {
            // If the job with this ID already exists, do nothing (return previous list)
            if (prev.some(job => job.id === payload.new.id)) {
              return prev;
            }
            // Otherwise, add it to the top
            showToast('New job received!', 'success');
            return [payload.new, ...prev];
          });
        }

        // If a job is updated (UPDATE)
        if (payload.eventType === 'UPDATE') {
          setJobs((prev) => prev.map((job) => (job.id === payload.new.id ? payload.new : job)));
        }
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // --- 2. ACTIONS (Async Supabase Calls) ---

  // JOBS
  const startJob = async (id) => {
    const { error } = await supabase.from('jobs').update({ status: 'In Progress' }).eq('id', id);
    if (!error) {
      setJobs(c => c.map(j => j.id === id ? { ...j, status: 'In Progress' } : j));
      showToast('Job started', 'success');
    }
  };

  const completeJob = async (id) => {
    const job = jobs.find(j => j.id === id);
    if (!job) return;

    // 1. Update Job Status
    const { error: jobError } = await supabase.from('jobs').update({ status: 'Completed' }).eq('id', id);

    if (!jobError) {
      // 2. Add History Note
      const historyEntry = {
        job_id: job.id,
        vehicle: job.vehicle,
        type: 'Service Record',
        content: `Job ${job.id} (${job.description}) marked as completed.`,
        tech: job.technician,
        // created_at is handled by DB
      };
      
      const { data: newNote, error: noteError } = await supabase.from('notes').insert([historyEntry]).select();

      // Optimistic Updates (Update UI immediately)
      setJobs(c => c.map(j => j.id === id ? { ...j, status: 'Completed' } : j));
      if (newNote) setNotes(curr => [newNote[0], ...curr]);

      showToast('Job completed & saved to DB', 'success');
    }
  };

  const addNewJob = async (formData) => {
    const newJob = {
      id: `J-${Math.floor(Math.random() * 10000)}`, // Generate ID frontend side, or use UUID
      vehicle: formData.vehicle,
      type: formData.type,
      priority: formData.priority,
      technician: formData.technician,
      description: formData.desc, // Map 'desc' to DB column 'description'
      report: formData.report,
      status: 'Pending'
    };

    const { data, error } = await supabase.from('jobs').insert([newJob]).select();

    if (!error && data) {
      setJobs(prev => [data[0], ...prev]);
      showToast('Job created in Database', 'success');
    } else {
      console.error(error);
      showToast('Error creating job', 'error');
    }
  };

  // DRIVERS
  const assignDriver = async (driverId, vehicleId) => {
    // Update Driver Table
    const { error } = await supabase
      .from('drivers')
      .update({ vehicle: vehicleId, status: 'Active' })
      .eq('id', driverId);

    if (!error) {
      setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, vehicle: vehicleId, status: 'Active' } : d));
      showToast(`Vehicle ${vehicleId} assigned`, 'success');
    }
  };

  const unassignDriver = async (driverId) => {
    const { error } = await supabase
      .from('drivers')
      .update({ vehicle: 'Not assigned', status: 'Idle' })
      .eq('id', driverId);

    if (!error) {
      setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, vehicle: 'Not assigned', status: 'Idle' } : d));
      showToast('Driver unassigned', 'success');
    }
  };

  // ALERTS
  const markAlertRead = async (id) => {
    await supabase.from('alerts').update({ status: 'Read' }).eq('id', id);
    setAlerts(c => c.map(a => a.id === id ? { ...a, status: 'Read' } : a));
  };
  
  const markAllAlertsRead = async () => {
    // In a real app, you'd loop or use a batch update
    // For now, optimistic update:
    setAlerts(c => c.map(a => ({ ...a, status: 'Read' })));
    showToast('All alerts marked read', 'success');
  };

  // NOTES
  const addNote = async (noteData) => {
    const { data, error } = await supabase.from('notes').insert([{
      vehicle: noteData.vehicle,
      type: noteData.type,
      content: noteData.content,
      tech: 'Juan dela Cruz', // Hardcoded user for MVP
    }]).select();

    if (!error && data) {
      setNotes(c => [data[0], ...c]);
      showToast('Note saved to Cloud', 'success');
    }
  };

  // --- STATS CALCULATION ---
  const stats = {
    total: jobs.length,
    inProgress: jobs.filter(j => j.status === 'In Progress').length,
    completed: jobs.filter(j => j.status === 'Completed').length,
    pending: jobs.filter(j => j.status === 'Pending').length,
    criticalVehicles: vehicles.filter(v => v.status === 'Critical').length,
    activeVehicles: vehicles.length,
    unreadAlerts: alerts.filter(a => a.status === 'Unread').length
  };

  return (
    <JobContext.Provider value={{ 
      jobs, vehicles, drivers, alerts, notes, stats, toast, loading,
      setToast, showToast,
      startJob, completeJob, addNewJob,
      unassignDriver, assignDriver,
      markAlertRead, markAllAlertsRead,
      addNote
    }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => useContext(JobContext);