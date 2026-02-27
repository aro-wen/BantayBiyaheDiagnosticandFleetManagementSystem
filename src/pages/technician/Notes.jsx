import React, { useState } from 'react';
import { Plus, Search, Filter, Car, ChevronRight, Eye, Hash, Truck, CheckCircle, FileText, Wrench, ClipboardList } from 'lucide-react';
import { useNoteManagement } from '../../hooks/useNoteManagement';
import NoteModal from '../../components/NoteModal'; 
import ViewNoteModal from '../../components/ViewNoteModal';

const Notes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('All Vehicles');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const { groupedNotes, uniqueVehicles, uniqueTypes, expandedGroups, setExpandedGroups } = 
    useNoteManagement(searchTerm, vehicleFilter, typeFilter);

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Technician Notes</h1>
          <p className="text-sm font-medium text-slate-500">Log observations and service records for fleet units</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm"
        >
          <Plus size={18} /> New Note
        </button>
      </header>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" placeholder="Search by tech, content, or unit..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <FilterSelect icon={<Car size={16}/>} value={vehicleFilter} onChange={setVehicleFilter} options={uniqueVehicles} />
          <FilterSelect icon={<Filter size={16}/>} value={typeFilter} onChange={setTypeFilter} options={uniqueTypes} />
        </div>
      </div>

      {/* Accordion Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Unit / Reference</th>
                <th className="px-6 py-4">Observation Details</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(groupedNotes).map(([vId, notes]) => (
                <VehicleNoteGroup 
                  key={vId} vId={vId} notes={notes} 
                  isExpanded={!!expandedGroups[vId]} 
                  onToggle={() => setExpandedGroups(p => ({...p, [vId]: !p[vId]}))}
                  onView={setSelectedNote}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NoteModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <ViewNoteModal isOpen={!!selectedNote} onClose={() => setSelectedNote(null)} note={selectedNote} />
    </div>
  );
};

const VehicleNoteGroup = ({ vId, notes, isExpanded, onToggle, onView }) => (
  <>
    <tr onClick={onToggle} className="bg-slate-50/30 hover:bg-blue-50/50 cursor-pointer select-none transition-colors border-b border-slate-100">
      <td colSpan="4" className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChevronRight size={18} className={`text-slate-300 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-blue-500' : ''}`} />
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-blue-600" />
              <span className="font-bold text-slate-700">{vId}</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400">{notes.length} Records</span>
        </div>
      </td>
    </tr>
    {isExpanded && notes.map(note => (
      <tr key={note.id} className="hover:bg-slate-50/50 transition-colors animate-in slide-in-from-top-1">
        <td className="px-6 py-4 pl-14 font-mono text-xs font-bold text-slate-400">
          <div className="flex items-center gap-1.5"><Hash size={12}/>{note.job_id || 'N/A'}</div>
        </td>
        <td className="px-6 py-4 max-w-md">
          <div className="flex flex-col gap-1.5">
            <NoteTypeBadge type={note.type} />
            <p className="text-sm font-semibold text-slate-600 line-clamp-1">{note.content}</p>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-700">{note.tech || 'Juan dela Cruz'}</span>
            <span className="text-[10px] font-bold text-slate-400">{new Date(note.created_at).toLocaleDateString()}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <button onClick={() => onView(note)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={20}/></button>
        </td>
      </tr>
    ))}
  </>
);

const FilterSelect = ({ icon, value, onChange, options }) => (
  <div className="relative min-w-[160px]">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</div>
    <select 
      className="w-full appearance-none bg-white border border-slate-200 pl-9 pr-8 py-2.5 rounded-xl text-sm font-bold text-slate-600 outline-none hover:bg-slate-50 transition-all cursor-pointer"
      value={value} onChange={(e) => onChange(e.target.value)}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const NoteTypeBadge = ({ type }) => {
  const styles = {
    'Repair': 'bg-red-50 text-red-600 border-red-100 icon:Wrench',
    'Inspection': 'bg-blue-50 text-blue-600 border-blue-100 icon:ClipboardList',
    'Service Record': 'bg-green-50 text-green-600 border-green-100 icon:CheckCircle'
  };
  const config = styles[type] || 'bg-slate-50 text-slate-500 border-slate-100 icon:FileText';
  return (
    <span className={`self-start px-2 py-0.5 rounded-lg text-[10px] font-bold border ${config.split(' icon:')[0]}`}>
      {type}
    </span>
  );
};

export default Notes;