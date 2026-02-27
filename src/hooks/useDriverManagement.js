import { useState, useMemo } from 'react';
import { useJobs } from '../contexts/JobContext';

export const useDriverManagement = (searchTerm, statusFilter) => {
  const { drivers, vehicles } = useJobs();
  const [optimisticOverrides, setOptimisticOverrides] = useState({});

  const displayDrivers = useMemo(() => {
    return drivers.map(d => ({
      ...d,
      vehicle: optimisticOverrides[d.id] !== undefined ? optimisticOverrides[d.id] : d.vehicle
    }));
  }, [drivers, optimisticOverrides]);

  const filteredDrivers = useMemo(() => {
    return displayDrivers.filter(driver => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        driver.name.toLowerCase().includes(searchLower) ||
        driver.id.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === 'All Status' || driver.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [displayDrivers, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: displayDrivers.length,
    assigned: displayDrivers.filter(d => d.vehicle && d.vehicle !== 'Not assigned').length,
    active: displayDrivers.filter(d => d.status === 'Active').length,
    trips: displayDrivers.reduce((acc, curr) => acc + (curr.trips || 0), 0),
  }), [displayDrivers]);

  const vehicleAvailability = useMemo(() => {
    const takenIds = displayDrivers
      .map(d => d.vehicle)
      .filter(v => v && v !== 'Not assigned');
    return vehicles.filter(v => !takenIds.includes(v.id));
  }, [vehicles, displayDrivers]);

  return { 
    filteredDrivers, 
    stats, 
    availableVehicles: vehicleAvailability, 
    setOptimisticOverrides,
    displayDrivers 
  };
};