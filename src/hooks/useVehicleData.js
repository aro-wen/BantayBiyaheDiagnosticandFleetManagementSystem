import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { syncVehicleAddress } from '../config/routeConfig';

export const useVehicleData = (vehicleId) => {
  const [vehicleData, setVehicleData] = useState({
    speed: 0, rpm: 0, temp: null, battery: null, fuel: null, mil: 'OFF',
    current_address: "Searching...", next_address: "Loading Route...", 
    lat: null, lng: null, activity: 'Inactive'
  });
  const [isLoading, setIsLoading] = useState(true);
  const isUpdatingManual = useRef(false);

  // --- FEATURE: NULLIFY TELEMETRY WHEN INACTIVE ---
  // This helper ensures the UI stays "dark" if the trip hasn't started.
  const applyInactivityFilter = (data) => {
    if (data.activity !== 'Active') {
      return {
        ...data,
        speed: null,
        rpm: null,
        temp: null,     // Set to null to show "---" in your dashboard
        battery: null,
        fuel: null,
        mil: 'OFF'
      };
    }
    return data;
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single();
        
      if (data) {
        setVehicleData(applyInactivityFilter(data));
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
        // Only update from Realtime if we aren't mid-manual-toggle
        if (!isUpdatingManual.current) {
          setVehicleData(prev => {
            const merged = { ...prev, ...payload.new };
            return applyInactivityFilter(merged);
          });
        }
        
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
  const manualSetVehicleData = (newDataOrUpdater) => {
    isUpdatingManual.current = true;
    
    setVehicleData(prev => {
      // Support for both direct objects and functional updates
      const resolvedData = typeof newDataOrUpdater === 'function' 
        ? newDataOrUpdater(prev) 
        : newDataOrUpdater;
        
      return applyInactivityFilter(resolvedData);
    });

    // Release the guard after a short delay
    setTimeout(() => { isUpdatingManual.current = false; }, 1000);
  };

  return { vehicleData, isLoading, setVehicleData: manualSetVehicleData };
};