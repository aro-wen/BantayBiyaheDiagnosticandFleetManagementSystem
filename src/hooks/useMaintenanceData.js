import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

export const useMaintenanceData = (searchTerm) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .order('next_due_date', { ascending: true });
      
      if (!error) setSchedules(data || []);
      setLoading(false);
    };

    fetchSchedules();

    const channel = supabase
      .channel('maintenance-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_schedules' }, 
      (payload) => {
        setSchedules(current => {
          let updated = [...current];
          if (payload.eventType === 'INSERT') updated.push(payload.new);
          else if (payload.eventType === 'UPDATE') {
            updated = updated.map(item => item.id === payload.new.id ? payload.new : item);
          } else if (payload.eventType === 'DELETE') {
            updated = updated.filter(item => item.id !== payload.old.id);
          }
          return updated.sort((a, b) => new Date(a.next_due_date || 0) - new Date(b.next_due_date || 0));
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredSchedules = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return schedules.filter(s => 
      s.vehicle_id?.toLowerCase().includes(search) ||
      s.service_type?.toLowerCase().includes(search)
    );
  }, [schedules, searchTerm]);

  const deleteSchedule = async (id) => {
    if (window.confirm("Remove this maintenance rule?")) {
      await supabase.from('maintenance_schedules').delete().eq('id', id);
    }
  };

  return { filteredSchedules, loading, deleteSchedule };
};