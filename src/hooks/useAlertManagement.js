import { useMemo } from 'react';
import { useJobs } from '../contexts/JobContext';

const CATEGORY_ORDER = ['Emergency', 'Diagnostic', 'Behavior', 'Maintenance', 'System'];

export const useAlertManagement = (filter) => {
  const { alerts } = useJobs();

  const processedData = useMemo(() => {
    // 1. Filter
    const filtered = alerts.filter(alert => {
      if (filter === 'All') return true;
      if (filter === 'Unread') return alert.status === 'Unread';
      if (filter === 'Critical') return alert.type === 'Critical';
      return true;
    });

    // 2. Categorize & Group by Vehicle
    const groups = {};
    filtered.forEach(alert => {
      const vId = alert.vehicle || 'Unknown';
      const msg = alert.message.toLowerCase();
      
      let category = 'System';
      if (msg.includes('sos') || msg.includes('emergency') || msg.includes('accident')) category = 'Emergency';
      else if (msg.includes('temp') || msg.includes('engine') || msg.includes('mil')) category = 'Diagnostic';
      else if (msg.includes('speed') || msg.includes('braking')) category = 'Behavior';
      else if (msg.includes('maintenance') || msg.includes('service')) category = 'Maintenance';

      if (!groups[vId]) groups[vId] = { alerts: [], hasSOS: false, hasCritical: false, categorized: {} };
      
      groups[vId].alerts.push({ ...alert, category });
      if (category === 'Emergency') groups[vId].hasSOS = true;
      if (alert.type === 'Critical') groups[vId].hasCritical = true;

      if (!groups[vId].categorized[category]) groups[vId].categorized[category] = [];
      groups[vId].categorized[category].push(alert);
    });

    // 3. Sort Vehicles: SOS -> Critical -> Recent
    const sortedVehicles = Object.entries(groups).sort(([, a], [, b]) => {
      if (a.hasSOS && !b.hasSOS) return -1;
      if (!a.hasSOS && b.hasSOS) return 1;
      if (a.hasCritical && !b.hasCritical) return -1;
      if (!a.hasCritical && b.hasCritical) return 1;
      return new Date(b.alerts[0].created_at) - new Date(a.alerts[0].created_at);
    });

    return sortedVehicles;
  }, [alerts, filter]);

  return { sortedGroupedAlerts: processedData, CATEGORY_ORDER };
};