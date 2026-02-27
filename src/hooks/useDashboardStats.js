import { useMemo } from 'react';
import { useJobs } from '../contexts/JobContext';

export const useDashboardStats = () => {
  const { vehicles, alerts, jobs, drivers } = useJobs();

  return useMemo(() => {
    // KPI Calculations
    const activeVehicles = drivers.filter(d => 
      d.status === 'Active' && d.vehicle && d.vehicle !== 'Not assigned'
    ).length;

    const activeJobs = jobs.filter(j => 
      ['In Progress', 'Pending'].includes(j.status)
    ).length;

    const unreadAlertsCount = alerts.filter(a => a.status === 'Unread').length;

    // Fleet Health Distribution
    const critical = vehicles.filter(v => 
      ['critical', 'warning', 'offline'].includes(v.status?.toLowerCase())
    );
    
    const healthyCount = vehicles.filter(v => 
      ['normal', 'idle', 'active'].includes(v.status?.toLowerCase())
    ).length;

    const maintenanceCount = vehicles.filter(v => 
      v.status?.toLowerCase() === 'maintenance'
    ).length;

    return {
      kpis: {
        activeVehicles,
        criticalCount: critical.length,
        activeJobs,
        unreadAlertsCount
      },
      health: {
        critical,
        healthyCount,
        maintenanceCount,
        total: vehicles.length || 1
      },
      recentAlerts: alerts?.slice(0, 4) || []
    };
  }, [vehicles, alerts, jobs, drivers]);
};