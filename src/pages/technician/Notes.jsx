import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  Car, 
  Wrench, 
  FileText,
  Clock 
} from 'lucide-react';
import { useJobs } from '../../contexts/JobContext';

const Notes = () => {
  const { notes, addNote } = useJobs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- SEARCH & FILTER STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('All Vehicles');
  const [typeFilter, setTypeFilter] = useState('All Types');

  // --- FORM STATE ---
  const [newNote, setNewNote] = useState({
    vehicle: 'V-101',
    type: 'General',
    content: ''
  });

  // --- DYNAMIC OPTIONS ---
  // Automatically find all unique vehicles and types that exist in the notes
  const uniqueVehicles = useMemo(() => 
    ['All Vehicles', ...new Set(notes.map(n => n.vehicle))], 
  [notes]);

  const uniqueTypes = useMemo(() => 
    ['All Types', ...new Set(notes.map(n => n.type))], 
  [notes]);

  // --- FILTER LOGIC ---
  const filteredNotes = notes.filter(note => {
    const searchLower = searchTerm.toLowerCase();
    
    // 1. Search Check
    const matchesSearch = 
      note.content.toLowerCase().includes(searchLower) ||
      note.vehicle.toLowerCase().includes(searchLower) ||
      note.tech.toLowerCase().includes(searchLower);

    // 2. Filter Checks
    const matchesVehicle = vehicleFilter === 'All Vehicles' || note.vehicle === vehicleFilter;
    const matchesType = typeFilter === 'All Types' || note.type === typeFilter;

    return matchesSearch && matchesVehicle && matchesType;
  });

  // --- HANDLERS ---
  const handleSubmit = (e) => {
    e.preventDefault();
    addNote(newNote);
    setIsModalOpen(false);
    setNewNote({ vehicle: 'V-101', type: 'General', content: '' });
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

      {/* 2. CONTROLS (Search & Filter) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search notes content..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters & Action */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          
          {/* Vehicle Filter */}
          <div className="relative">
            <select 
              className="appearance-none bg-slate-50 border-none pl-10 pr-8 py-2 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100"
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
            >
              {uniqueVehicles.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <Car className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select 
              className="appearance-none bg-slate-50 border-none pl-10 pr-8 py-2 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <Filter className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>

          {/* Add Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} className="mr-2" />
            Add Note
          </button>
        </div>
      </div>

      {/* 3. NOTES LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div key={note.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    note.type === 'Repair' ? 'bg-red-100 text-red-600' :
                    note.type === 'Inspection' ? 'bg-blue-100 text-blue-600' :
                    note.type === 'Service Record' ? 'bg-green-100 text-green-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {note.type === 'Repair' ? <Wrench size={18} /> :
                     note.type === 'Service Record' ? <FileText size={18} /> :
                     <ClipboardList size={18} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{note.vehicle}</h3>
                    <span className="text-xs text-slate-500 font-medium">{note.type}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 flex items-center bg-slate-50 px-2 py-1 rounded-full">
                  <Clock size={12} className="mr-1" /> {note.time}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {note.content}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">Technician: <span className="font-semibold text-slate-600">{note.tech}</span></span>
                {note.jobId && <span className="text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded">Ref: {note.jobId}</span>}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <div className="text-slate-400 mb-2">No notes found matching your filters.</div>
            <button 
              onClick={() => {setSearchTerm(''); setVehicleFilter('All Vehicles'); setTypeFilter('All Types');}}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* 4. ADD NOTE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Add New Note</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Vehicle</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newNote.vehicle}
                  onChange={(e) => setNewNote({...newNote, vehicle: e.target.value})}
                >
                  <option value="V-101">V-101</option>
                  <option value="V-102">V-102</option>
                  <option value="V-103">V-103</option>
                  <option value="V-109">V-109</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newNote.type}
                  onChange={(e) => setNewNote({...newNote, type: e.target.value})}
                >
                  <option value="General">General</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Repair">Repair</option>
                  <option value="Incident">Incident</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Content</label>
                <textarea 
                  required
                  rows="4"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Enter observation details..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-500 font-medium hover:text-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Notes;