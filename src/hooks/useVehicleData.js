import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { syncVehicleAddress } from '../config/routeConfig';

export const useVehicleData = (vehicleId) => {
  const [vehicleData, setVehicleData] = useState({
    speed: 0, rpm: 0, temp: 85, battery: 12.8, fuel: 65, mil: 'OFF',
    current_address: "Searching...", next_address: "Loading Route...", 
    lat: null, lng: null, activity: 'Inactive'
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Use a ref to track if WE are currently updating the DB
  const isUpdatingManual = useRef(false);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single();
        
      if (data) setVehicleData(data);
      setIsLoading(false);
    };

    init();

    const channel = supabase.channel(`telemetry-${vehicleId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'vehicles', 
        filter: `id=eq.${vehicleId}` 
      }, (payload) => {
        // Only update from Realtime if we aren't mid-manual-toggle
        if (!isUpdatingManual.current) {
          setVehicleData(prev => ({ ...prev, ...payload.new }));
        }
        
        // Only sync address if coordinates actually changed to save bandwidth
        if (payload.new.lat || payload.new.lng) {
          syncVehicleAddress(vehicleId);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vehicleId]);

  // Wrap setVehicleData to handle the manual guard
  const manualSetVehicleData = (newData) => {
    isUpdatingManual.current = true;
    setVehicleData(newData);
    // Release the guard after a short delay to allow DB propagation
    setTimeout(() => { isUpdatingManual.current = false; }, 1000);
  };

  return { vehicleData, isLoading, setVehicleData: manualSetVehicleData };
};