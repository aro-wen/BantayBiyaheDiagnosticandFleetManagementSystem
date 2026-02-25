import React, { useState, useMemo, useEffect } from 'react';
import { 
  ClipboardList, Plus, Search, Filter, Car, Wrench, FileText,
  Clock, ChevronDown, ChevronRight, Eye, Hash, Truck, CheckCircle
} from 'lucide-react';
import { useJobs } from '../../contexts/JobContext';
import NoteModal from '../../components/NoteModal';     
import ViewNoteModal from '../../components/ViewNoteModal'; 

const Notes = () => {
  const { notes } = useJobs();
  
  // --- STATE ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('All Vehicles');
  const [typeFilter, setTypeFilter] = useState('All Types');

  // 🔥 SCALABILITY: Track open/closed folders
  const [expandedGroups, setExpandedGroups] = useState({});

  // --- 1. MEMOIZED SOURCE DATA ---
  const sortedNotes = useMemo(() => 
    [...notes].sort((a, b) => new Date(b.created_at || b.time || 0) - new Date(a.created_at || a.time || 0)), 
  [notes]);

  const uniqueVehicles = useMemo(() => 
    ['All Vehicles', ...new Set(notes.map(n => n.vehicle))], 
  [notes]);

  const uniqueTypes = useMemo(() => 
    ['All Types', ...new Set(notes.map(n => n.type))], 
  [notes]);

  // --- 2. MEMOIZED FILTERING ---
  const filteredNotes = useMemo(() => {
    return sortedNotes.filter(note => {
      const searchLower = searchTerm.toLowerCase();
      const content = note.content || '';
      
      const matchesSearch = 
        content.toLowerCase().includes(searchLower) ||
        note.vehicle.toLowerCase().includes(searchLower) ||
        (note.tech || '').toLowerCase().includes(searchLower);

      const matchesVehicle = vehicleFilter === 'All Vehicles' || note.vehicle === vehicleFilter;
      const matchesType = typeFilter === 'All Types' || note.type === typeFilter;

      return matchesSearch && matchesVehicle && matchesType;
    });
  }, [sortedNotes, searchTerm, vehicleFilter, typeFilter]);

  // --- 3. MEMOIZED GROUPING ---
  const groupedNotes = useMemo(() => {
    const groups = {};
    filteredNotes.forEach(note => {
      const vId = note.vehicle || 'Unknown';
      if (!groups[vId]) groups[vId] = [];
      groups[vId].push(note);
    });
    // Sort keys alphabetically
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {});
  }, [filteredNotes]);

  // --- 4. AUTO-EXPAND EFFECT ---
  useEffect(() => {
    if (searchTerm) {
      const allGroupIds = Object.keys(groupedNotes).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setExpandedGroups(allGroupIds);
    } 
  }, [searchTerm, groupedNotes]);

  // Helper for Type Icons/Colors
  const getTypeStyle = (type) => {
    switch(type) {
        case 'Repair': return { color: 'bg-red-50 text-red-700 border-red-100', icon: <Wrench size={12} className="mr-1.5"/> };
        case 'Inspection': return { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <ClipboardList size={12} className="mr-1.5"/> };
        case 'Service Record': return { color: 'bg-green-50 text-green-700 border-green-100', icon: <FileText size={12} className="mr-1.5"/> };
        default: return { color: 'bg-slate-50 text-slate-700 border-slate-100', icon: <FileText size={12} className="mr-1.5"/> };
    }
  };

  const toggleGroup = (vehicleId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [vehicleId]: !prev[vehicleId]
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Technician Notes</h1>
          <p className="text-slate-500">Log observations grouped by vehicle</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} className="mr-2" />
          Add Note
        </button>
      </div>

      {/* CONTROLS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search notes..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-slate-200 pl-10 pr-8 py-2 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-50"
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
            >
              {uniqueVehicles.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <Car className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={14} />
          </div>

          <div className="relative">
            <select 
              className="appearance-none bg-white border border-slate-200 pl-10 pr-8 py-2 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-50"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <Filter className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                <th className="px-6 py-4">Vehicle / Job Ref</th>
                <th className="px-6 py-4">Note Content</th>
                <th className="px-6 py-4">Technician</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.keys(groupedNotes).length > 0 ? (
                Object.entries(groupedNotes).map(([vehicleId, vehicleNotes]) => {
                  const isExpanded = expandedGroups[vehicleId];
                  
                  return (
                  <React.Fragment key={vehicleId}>
                    {/* --- 1. GROUP HEADER --- */}
                    <tr 
                      onClick={() => toggleGroup(vehicleId)}
                      className="bg-slate-50/50 hover:bg-blue-50 cursor-pointer border-b border-slate-100 transition-colors select-none"
                    >
                      <td colSpan="4" className="px-6 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded transition-transform duration-200 ${isExpanded ? 'rotate-90 bg-blue-100 text-blue-600' : 'text-slate-400'}`}>
                              <ChevronRight size={16} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Truck size={16} className="text-slate-400" />
                              <span className="font-bold text-slate-700 text-sm">{vehicleId}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm">
                            {vehicleNotes.length} Notes
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* --- 2. EXPANDED ROWS --- */}
                    {isExpanded && vehicleNotes.map((note) => {
                      const style = getTypeStyle(note.type);
                      return (
                        <tr key={note.id} className="hover:bg-slate-50 transition-colors animate-in slide-in-from-top-1 duration-200">
                          
                          {/* Col 1: Job Ref (Indented) */}
                          <td className="px-6 py-4 align-top w-48 pl-14 border-l-4 border-l-blue-100/50">
                             <div className="flex items-center gap-2 text-slate-500 font-mono text-xs mt-1">
                               <Hash size={12} className="text-slate-300" />
                               {note.job_id || '-'}
                             </div>
                          </td>

                          {/* Col 2: Type + Content Stacked */}
                          <td className="px-6 py-4 align-top w-2/5">
                            <div className="flex flex-col gap-1.5">
                              <span className={`self-start inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${style.color}`}>
                                {style.icon} {note.type}
                              </span>
                              <p className="text-sm text-slate-600 line-clamp-2" title={note.content}>
                                {note.content}
                              </p>
                            </div>
                          </td>

                          {/* Col 3: Technician + Date Stacked */}
                          <td className="px-6 py-4 align-top">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                                {note.tech ? note.tech.charAt(0) : 'U'}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700">
                                  {note.tech || 'Unknown'}
                                </span>
                                <span className="text-xs text-slate-400 mt-0.5">
                                  {note.created_at ? new Date(note.created_at).toLocaleDateString() : note.time}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Col 4: Action */}
                          <td className="px-6 py-4 align-top text-right">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedNote(note); }}
                              className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                              title="View Note"
                            >
                              <Eye size={20} />
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </React.Fragment>
                )})
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle size={24} className="text-slate-300" />
                      </div>
                      <p>No notes found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      <NoteModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        defaultValues={null} 
      />

      <ViewNoteModal 
        isOpen={!!selectedNote} 
        onClose={() => setSelectedNote(null)} 
        note={selectedNote} 
      />

    </div>
  );
};

export default Notes;