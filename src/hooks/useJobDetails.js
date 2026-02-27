import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useJobs } from '../contexts/JobContext';

export const useJobDetails = (id) => {
  const { jobs, vehicles, notes, startJob, completeJob, addNote } = useJobs();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      // Attempt to find job in context with flexible ID matching
      const found = jobs.find(j => String(j.id).toLowerCase().includes(String(id).toLowerCase()));

      if (found) {
        setJob(found);
      } else {
        const { data } = await supabase.from('jobs').select('*').eq('id', id).single();
        setJob(data || null);
      }
      setIsLoading(false);
    };
    fetchJob();
  }, [id, jobs]);

  const vehicle = vehicles.find(v => v.id === job?.vehicle);
  const history = notes
    .filter(n => n.vehicle === job?.vehicle)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return { job, vehicle, history, isLoading, isSubmitting, startJob, completeJob, addNote, setIsSubmitting };
};