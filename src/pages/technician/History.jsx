import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, FileText, ChevronRight, Printer, Truck, Hash } from 'lucide-react';
import { useMaintenanceHistory } from '../../hooks/useMaintenanceHistory';
import ServiceReportModal from '../../components/ServiceReportModal';
import DateRangeReportModal from '../../components/DateRangeReportModal';

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  const { groupedHistory, rawFiltered, uniqueTypes, notes } = useMaintenanceHistory(searchTerm, typeFilter, dateFilter);

  const activeReport = rawFiltered.find(j => j.id === selectedReportId);
  const relatedNotes = notes.filter(n => n.job_id === selectedReportId);

  useEffect(() => {
    if (searchTerm) {
      const allKeys = Object.keys(groupedHistory).reduce((acc, k) => ({ ...acc, [k]: true }), {});
      setExpandedGroups(allKeys);
    }
  }, [searchTerm, groupedHistory]);

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Maintenance History</h1>
          <p className="text-sm font-medium text-slate-500">Archive of completed services for BantayBiyahe units</p>
        </div>
        <button onClick={() => setIsRangeModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 shadow-sm transition-all">
          <Printer size={18} /> Export Data
        </button>
      </header>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" placeholder="Search vehicle, ID, or description..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <FilterDropdown icon={<Calendar size={16}/>} value={dateFilter} onChange={setDateFilter} options={['All Time', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days']} />
          <FilterDropdown icon={<Filter size={16}/>} value={typeFilter} onChange={setTypeFilter} options={uniqueTypes} />
        </div>
      </div>

      {/* Grouped Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Vehicle / Job ID</th>
                <th className="px-6 py-4">Service Details</th>
                <th className="px-6 py-4">Personnel</th>
                <th className="px-6 py-4 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(groupedHistory).map(([vehicleId, jobs]) => (
                <VehicleGroup 
                  key={vehicleId} vehicleId={vehicleId} jobs={jobs} 
                  isExpanded={!!expandedGroups[vehicleId]} 
                  onToggle={() => setExpandedGroups(p => ({ ...p, [vehicleId]: !p[vehicleId] }))}
                  onViewReport={setSelectedReportId}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ServiceReportModal isOpen={!!selectedReportId} onClose={() => setSelectedReportId(null)} report={activeReport} relatedNotes={relatedNotes} />
      <DateRangeReportModal isOpen={isRangeModalOpen} onClose={() => setIsRangeModalOpen(false)} jobs={rawFiltered} />
    </div>
  );
};

const VehicleGroup = ({ vehicleId, jobs, isExpanded, onToggle, onViewReport }) => (
  <>
    <tr onClick={onToggle} className="bg-slate-50/30 hover:bg-blue-50/50 cursor-pointer select-none transition-colors border-b border-slate-100">
      <td colSpan="4" className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChevronRight size={18} className={`text-slate-300 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-blue-500' : ''}`} />
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-blue-600" />
              <span className="font-bold text-slate-700">{vehicleId}</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 shadow-sm">{jobs.length} Services</span>
        </div>
      </td>
    </tr>
    {isExpanded && jobs.map(job => (
      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors animate-in slide-in-from-top-1">
        <td className="px-6 py-4 pl-14 font-mono text-xs font-bold text-slate-400">
          <div className="flex items-center gap-1.5"><Hash size={12}/>{job.id}</div>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col gap-1">
            <span className={`text-[10px] font-bold self-start px-2 py-0.5 rounded-lg border ${job.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
              {job.type || 'Maintenance'}
            </span>
            <p className="text-sm font-semibold text-slate-600 leading-snug max-w-sm line-clamp-1">{job.description}</p>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
              {job.technician?.charAt(0) || 'J'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">{job.technician || 'Juan dela Cruz'}</span>
              <span className="text-[10px] font-bold text-slate-400">{new Date(job.created_at || job.date).toLocaleDateString()}</span>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <button onClick={() => onViewReport(job.id)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><FileText size={20}/></button>
        </td>
      </tr>
    ))}
  </>
);

const FilterDropdown = ({ icon, value, onChange, options }) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</div>
    <select 
      className="appearance-none bg-white border border-slate-200 pl-9 pr-8 py-2.5 rounded-xl text-sm font-bold text-slate-600 outline-none hover:bg-slate-50 transition-all cursor-pointer"
      value={value} onChange={(e) => onChange(e.target.value)}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default History;