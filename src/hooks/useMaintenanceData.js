import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

export const useMaintenanceData = (searchTerm = '') => {
  const [vehicles, setVehicles] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // FETCH WITH JOIN: Pulls vehicle data AND the associated tracking row
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          maintenance_tracking (*)
        `)
        .order('id', { ascending: true });

      if (!error) {
        setVehicles(data || []);
      }
      setLoading(false);
    };

    fetchData();

    // REALTIME: Listen for Odometer updates in 'vehicles'
    const vehicleChannel = supabase
      .channel('vehicles-realtime')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'vehicles' }, 
        async (payload) => {
          // When a vehicle updates, we need to ensure we still have its tracking data
          setVehicles(current => 
            current.map(v => v.id === payload.new.id ? { ...v, ...payload.new } : v)
          );
        }
      )
      .subscribe();

    // REALTIME: Listen for Reset updates in 'maintenance_tracking'
    const trackingChannel = supabase
      .channel('tracking-realtime')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'maintenance_tracking' }, 
        (payload) => {
          setVehicles(current => 
            current.map(v => v.id === payload.new.vehicle_id 
              ? { ...v, maintenance_tracking: payload.new } 
              : v
            )
          );
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(vehicleChannel); 
      trackingChannel && supabase.removeChannel(trackingChannel);
    };
  }, []);

  // Filter vehicles based on ID or Bound (Forward/Return)
  const filteredVehicles = useMemo(() => {
    const search = (searchTerm || '').toLowerCase();
    return vehicles.filter(v => {
      const id = (v.id || '').toLowerCase();
      const direction = (v.trip_direction || '').toLowerCase();
      return id.includes(search) || direction.includes(search);
    });
  }, [vehicles, searchTerm]);

  return { vehicles: filteredVehicles, loading };
};