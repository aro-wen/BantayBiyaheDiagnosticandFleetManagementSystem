import { useState, useMemo, useCallback } from 'react';
import { useJobs } from '../contexts/JobContext';

export const useFleetMonitoring = () => {
  const { vehicles } = useJobs();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 🔥 New state to fix Leaflet grey areas
  const [mapKey, setMapKey] = useState(0);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = 
        v.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (v.plate && v.plate.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Normalize both sides to lowercase to handle Supabase casing inconsistencies
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
    // 🔥 Increment key to force MapContainer to re-mount/re-size
    setMapKey(prev => prev + 1);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    // Don't null the vehicle immediately so the modal exit animation
    // has data to show while it fades out
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
    mapKey, // 🔥 Pass this to your Modal's MapContainer key attribute
    openModal,
    closeModal
  };
};