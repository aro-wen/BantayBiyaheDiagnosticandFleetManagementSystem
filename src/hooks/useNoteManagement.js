import { useState, useMemo, useEffect } from 'react';
import { useJobs } from '../contexts/JobContext';

export const useNoteManagement = (searchTerm, vehicleFilter, typeFilter) => {
  const { notes } = useJobs();
  const [expandedGroups, setExpandedGroups] = useState({});

  const data = useMemo(() => {
    // 1. Base Filter & Sort
    const filtered = [...notes]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .filter(note => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = (note.content || '').toLowerCase().includes(search) ||
                              note.vehicle.toLowerCase().includes(search) ||
                              (note.tech || '').toLowerCase().includes(search);
        const matchesVehicle = vehicleFilter === 'All Vehicles' || note.vehicle === vehicleFilter;
        const matchesType = typeFilter === 'All Types' || note.type === typeFilter;
        return matchesSearch && matchesVehicle && matchesType;
      });

    // 2. Metadata for Filters
    const vehicles = ['All Vehicles', ...new Set(notes.map(n => n.vehicle))];
    const types = ['All Types', ...new Set(notes.map(n => n.type))];

    // 3. Group by Vehicle
    const groups = filtered.reduce((acc, note) => {
      const vId = note.vehicle || 'Unknown';
      if (!acc[vId]) acc[vId] = [];
      acc[vId].push(note);
      return acc;
    }, {});

    return { groupedNotes: groups, uniqueVehicles: vehicles, uniqueTypes: types };
  }, [notes, searchTerm, vehicleFilter, typeFilter]);

  // Auto-expand groups when searching
  useEffect(() => {
    if (searchTerm) {
      const allKeys = Object.keys(data.groupedNotes).reduce((acc, k) => ({ ...acc, [k]: true }), {});
      setExpandedGroups(allKeys);
    }
  }, [searchTerm, data.groupedNotes]);

  return { ...data, expandedGroups, setExpandedGroups };
};