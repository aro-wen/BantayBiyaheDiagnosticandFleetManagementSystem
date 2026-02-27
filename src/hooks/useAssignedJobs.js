import { useState, useMemo } from 'react';
import { useJobs } from '../contexts/JobContext';

export const useAssignedJobs = (filter, techName) => {
  const { jobs, startJob, addNote } = useJobs();
  const [optimisticStatus, setOptimisticStatus] = useState({});
  const [loadingJobId, setLoadingJobId] = useState(null);

  const data = useMemo(() => {
    // Merge real-time data with local optimistic updates
    const effectiveJobs = jobs.map(job => ({
      ...job,
      status: optimisticStatus[job.id] || job.status
    }));

    const myActiveJobs = effectiveJobs.filter(j => 
      j.technician === techName && j.status !== 'Completed'
    );

    const filtered = filter === 'All' ? myActiveJobs : myActiveJobs.filter(j => j.priority === filter);

    return {
      displayedJobs: filtered,
      stats: {
        pending: myActiveJobs.filter(j => j.status === 'Pending').length,
        active: myActiveJobs.filter(j => j.status === 'In Progress').length,
        completed: jobs.filter(j => j.technician === techName && j.status === 'Completed').length
      }
    };
  }, [jobs, optimisticStatus, filter, techName]);

  const initiateJob = async (id) => {
    setLoadingJobId(id);
    setOptimisticStatus(prev => ({ ...prev, [id]: 'In Progress' }));
    try {
      await startJob(id);
    } catch (err) {
      setOptimisticStatus(prev => {
        const reset = { ...prev };
        delete reset[id];
        return reset;
      });
    } finally {
      setLoadingJobId(null);
    }
  };

  return { ...data, loadingJobId, initiateJob, addNote };
};