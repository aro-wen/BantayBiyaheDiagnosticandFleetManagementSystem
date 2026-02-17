import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  Car, 
  Wrench, 
  FileText,
  Clock,
  ChevronDown,
  Eye,
  User
} from 'lucide-react';
import { useJobs } from '../../contexts/JobContext';
import NoteModal from '../../components/NoteModal';     // Your existing Add Modal
import ViewNoteModal from '../../components/ViewNoteModal'; // The new Read-Only Modal

const Notes = () => {
  const { notes } = useJobs();
  
  // --- STATE ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null); // For Viewing
  
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('All Vehicles');
  const [typeFilter, setTypeFilter] = useState('All Types');

  // --- DYNAMIC OPTIONS ---
  const uniqueVehicles = useMemo(() => 
    ['All Vehicles', ...new Set(notes.map(n => n.vehicle))], 
  [notes]);

  const uniqueTypes = useMemo(() => 
    ['All Types', ...new Set(notes.map(n => n.type))], 
  [notes]);

  // --- FILTER LOGIC ---
  const filteredNotes = notes.filter(note => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      note.content.toLowerCase().includes(searchLower) ||
      note.vehicle.toLowerCase().includes(searchLower) ||
      (note.tech || '').toLowerCase().includes(searchLower);

    const matchesVehicle = vehicleFilter === 'All Vehicles' || note.vehicle === vehicleFilter;
    const matchesType = typeFilter === 'All Types' || note.type === typeFilter;

    return matchesSearch && matchesVehicle && matchesType;
  });

  // Helper for Type Icons/Colors
  const getTypeStyle = (type) => {
    switch(type) {
        case 'Repair': return { color: 'bg-red-50 text-red-700 border-red-100', icon: <Wrench size={12} className="mr-1.5"/> };
        case 'Inspection': return { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <ClipboardList size={12} className="mr-1.5"/> };
        case 'Service Record': return { color: 'bg-green-50 text-green-700 border-green-100', icon: <FileText size={12} className="mr-1.5"/> };
        default: return { color: 'bg-slate-50 text-slate-700 border-slate-100', icon: <FileText size={12} className="mr-1.5"/> };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Technician Notes</h1>
          <p className="text-slate-500">Log observations and track vehicle history</p>
        </div>
      </div>

      {/* 2. CONTROLS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search notes..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
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

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} className="mr-2" />
            Add Note
          </button>
        </div>
      </div>

      {/* 3. NOTES TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Technician</th>
                <th className="px-6 py-4">Job Ref</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => {
                  const style = getTypeStyle(note.type);
                  return (
                    <tr key={note.id} className="hover:bg-slate-50 transition-colors">
                      {/* Vehicle */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">{note.vehicle}</span>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${style.color}`}>
                            {style.icon} {note.type}
                         </span>
                      </td>

                      {/* Technician */}
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {note.tech ? note.tech.charAt(0) : 'U'}
                            </div>
                            <span className="text-sm text-slate-600">{note.tech || 'Unknown'}</span>
                         </div>
                      </td>

                      {/* Job Ref */}
                      <td className="px-6 py-4">
                        {note.job_id ? (
                            <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                {note.job_id}
                            </span>
                        ) : (
                            <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                         {note.created_at ? new Date(note.created_at).toLocaleDateString() : note.time}
                      </td>

                      {/* VIEW BUTTON */}
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedNote(note)}
                          className="inline-flex items-center px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                        >
                          <Eye size={14} className="mr-1.5" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No notes found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODALS */}
      
      {/* Add Note Modal */}
      <NoteModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        defaultValues={null} 
      />

      {/* View Note Modal */}
      <ViewNoteModal 
        isOpen={!!selectedNote} 
        onClose={() => setSelectedNote(null)} 
        note={selectedNote} 
      />

    </div>
  );
};

export default Notes;