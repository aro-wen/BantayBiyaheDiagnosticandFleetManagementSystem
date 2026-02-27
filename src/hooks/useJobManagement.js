import { useMemo } from 'react';
import { useJobs } from '../contexts/JobContext';

export const useJobManagement = (searchTerm, statusFilter, priorityFilter) => {
  const { jobs } = useJobs();

  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    // 1. Calculate Metrics
    const activeCount = jobs.filter(j => ['In Progress', 'Pending'].includes(j.status)).length;
    const completedToday = jobs.filter(j => {
      const isDone = j.status === 'Completed';
      const isToday = j.created_at?.split('T')[0] === today;
      return isDone && isToday;
    }).length;
    const pendingCount = jobs.filter(j => j.status === 'Pending').length;

    // 2. Filter & Sort
    const filtered = [...jobs]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .filter(job => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
          job.id.toLowerCase().includes(search) ||
          job.vehicle.toLowerCase().includes(search) ||
          (job.technician || '').toLowerCase().includes(search);

        const matchesStatus = statusFilter === 'All Status' || job.status === statusFilter;
        const matchesPriority = priorityFilter === 'All Priority' || job.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      });

    return {
      metrics: { activeCount, completedToday, pendingCount },
      filteredJobs: filtered
    };
  }, [jobs, searchTerm, statusFilter, priorityFilter]);
};