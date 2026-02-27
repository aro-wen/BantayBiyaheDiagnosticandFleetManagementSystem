import { useMemo } from 'react';
import { useMaintenanceData } from './useMaintenanceData';

export const useCalendarData = (currentMonth) => {
  const { filteredSchedules, loading } = useMaintenanceData('');

  return useMemo(() => {
    // Generate days for the current month view
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Padding for previous month days
    for (let i = 0; i < firstDay; i++) days.push({ date: null });

    // Actual month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = new Date(year, month, d).toISOString().split('T')[0];
      const daySchedules = filteredSchedules.filter(s => s.next_due_date === dateStr);
      days.push({ date: d, fullDate: dateStr, items: daySchedules });
    }

    return { days, loading };
  }, [filteredSchedules, currentMonth]);
};