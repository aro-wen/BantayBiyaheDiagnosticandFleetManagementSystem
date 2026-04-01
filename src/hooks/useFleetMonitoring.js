import { useState, useMemo, useCallback, useEffect } from 'react';
import { useJobs } from '../contexts/JobContext';
import { syncVehicleAddress } from '../config/routeConfig'; // Ensure this path is correct

export const useFleetMonitoring = () => {
  const { vehicles } = useJobs();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  // --- 🔥 NEW: AUTOMATIC ROUTE SYNCING ---
  // This effect watches the raw vehicle data. When a coordinate changes,
  // it triggers the distance math in routing.js to update the address.
  useEffect(() => {
    vehicles.forEach(vehicle => {
      // Only sync if the vehicle is 'Active' and has coordinates
      if (vehicle.activity?.toLowerCase() === 'active' && vehicle.lat && vehicle.lng) {
        syncVehicleAddress(vehicle.id);
      }
    });
  }, [vehicles]); // Fires whenever useJobs receives a real-time update

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = 
        v.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (v.plate && v.plate.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const currentStatus = v.activity?.toLowerCase() || '';
      const targetFilter = statusFilter.toLowerCase();

      const matchesStatus = 
        targetFilter === 'all' || 
        currentStatus === targetFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchTerm, statusFilter]);

  const openModal = useCallback((vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
    setMapKey(prev => prev + 1);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedVehicle(null), 300);
  }, []);

  return {
    filteredVehicles,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedVehicle,
    isModalOpen,
    mapKey,
    openModal,
    closeModal
  };
};