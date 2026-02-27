import { useMemo } from 'react';
import { useJobs } from '../contexts/JobContext';

export const useMaintenanceHistory = (searchTerm, typeFilter, dateFilter) => {
  const { jobs, notes } = useJobs();

  return useMemo(() => {
    // 1. Base filtered list
    const filtered = jobs
      .filter(j => j.status === 'Completed')
      .filter(item => {
        const search = searchTerm.toLowerCase();
        const desc = (item.desc || item.description || '').toLowerCase();
        
        const matchesSearch = item.vehicle.toLowerCase().includes(search) || 
                              desc.includes(search) || 
                              item.id.toLowerCase().includes(search);
        
        const matchesType = typeFilter === 'All Types' || (item.type || 'Maintenance') === typeFilter;

        let matchesDate = true;
        if (dateFilter !== 'All Time') {
          const jobDate = new Date(item.created_at || item.date);
          const diffDays = Math.ceil(Math.abs(new Date() - jobDate) / (1000 * 60 * 60 * 24));
          if (dateFilter === 'Last 7 Days') matchesDate = diffDays <= 7;
          if (dateFilter === 'Last 30 Days') matchesDate = diffDays <= 30;
          if (dateFilter === 'Last 90 Days') matchesDate = diffDays <= 90;
        }

        return matchesSearch && matchesType && matchesDate;
      })
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    // 2. Alphabetical grouping by Vehicle ID
    const grouped = {};
    filtered.forEach(job => {
      const vId = job.vehicle || 'Unknown';
      if (!grouped[vId]) grouped[vId] = [];
      grouped[vId].push(job);
    });

    const sortedGroups = Object.keys(grouped).sort().reduce((acc, key) => {
      acc[key] = grouped[key];
      return acc;
    }, {});

    const uniqueTypes = ['All Types', ...new Set(jobs.filter(j => j.status === 'Completed').map(j => j.type || 'Maintenance'))];

    return { groupedHistory: sortedGroups, rawFiltered: filtered, uniqueTypes, notes };
  }, [jobs, notes, searchTerm, typeFilter, dateFilter]);
};