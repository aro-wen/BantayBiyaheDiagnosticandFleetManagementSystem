import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import dtcData from '../data/dtcCodes.json'; 

export const useVehicleDTC = (vehicleId) => {
  const [translatedDTCs, setTranslatedDTCs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vehicleId) {
      setIsLoading(false);
      return;
    }

    const fetchDTCs = async () => {
      setIsLoading(true);
      try {
        // 1. Query your dedicated table (Change 'dtcs' if your table name is different)
        const { data, error } = await supabase
          .from('dtcs') 
          .select('*')
          .eq('vehicle_id', vehicleId)
          .neq('status', 'cleared') // 🔥 IGNORE CLEARED CODES
          .order('created_at', { ascending: false });

        if (error) throw error;

        // 2. Translate the codes using your JSON file
        const translated = data.map(fault => {
          const categoryPrefix = fault.code.substring(0, 3) + "XX";
          return {
            ...fault, // Keep id, severity, status, etc.
            // Overwrite the "EMPTY" description from the DB with the JSON data
            description: dtcData.codes[fault.code] || "Unknown Diagnostic Trouble Code",
            category: dtcData.classes[categoryPrefix] || "Uncategorized Subsystem"
          };
        });

        setTranslatedDTCs(translated);
      } catch (err) {
        console.error("Error fetching DTCs:", err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDTCs();

    // 3. Real-time listener for the dedicated table
    const channel = supabase
      .channel(`dtc-table-updates-${vehicleId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE, or DELETE
          schema: 'public',
          table: 'dtcs', // Match your table name here
          filter: `vehicle_id=eq.${vehicleId}`
        },
        () => {
          // Re-fetch the list if anything changes so we re-filter the cleared ones
          fetchDTCs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vehicleId]);

  return {
    translatedDTCs,
    hasFaults: translatedDTCs.length > 0,
    isLoading,
    error
  };
};