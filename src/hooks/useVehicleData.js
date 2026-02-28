import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { syncVehicleAddress } from '../config/routeConfig';

export const useVehicleData = (vehicleId) => {
  const [vehicleData, setVehicleData] = useState({
    speed: 0, rpm: 0, temp: 85, battery: 12.8, fuel: 65, mil: 'OFF',
    current_address: "Searching...", next_address: "Loading Route...", 
    lat: null, lng: null, activity: 'Inactive'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single();
        
      if (data) {
        setVehicleData(data);
        // Process address immediately on load for the Raspberry Pi display
        await syncVehicleAddress(vehicleId);
      }
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
        // Update local state with new telemetry from the Pi
        setVehicleData(prev => ({ ...prev, ...payload.new }));
        
        // Sync addresses in background whenever coordinates update
        syncVehicleAddress(vehicleId);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [vehicleId]);

  return { vehicleData, isLoading, setVehicleData };
};