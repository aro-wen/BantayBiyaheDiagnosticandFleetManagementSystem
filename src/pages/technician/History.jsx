import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Calendar, Filter, FileText, CheckCircle, 
  ChevronDown, ChevronRight, Printer, Truck, Hash 
} from 'lucide-react';
import { useJobs } from '../../contexts/JobContext';
import ServiceReportModal from '../../components/ServiceReportModal';
import DateRangeReportModal from '../../components/DateRangeReportModal';

const History = () => {
  // 1. GET DATA FROM CONTEXT (Jobs & Notes)
  const { jobs, notes } = useJobs(); 
  
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [dateFilter, setDateFilter] = useState('All Time');
  
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);
  
  // Track open/closed folders for Accordion
  const [expandedGroups, setExpandedGroups] = useState({});

  // --- 2. MEMOIZED SOURCE DATA ---
  const completedJobs = useMemo(() => 
    jobs
      .filter(j => j.status === 'Completed')
      .sort((a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0)), 
  [jobs]);

  // 🔥 CONNECT HISTORY TO NOTES 🔥
  // Find the active report object
  const activeReport = useMemo(() => 
    selectedReportId ? completedJobs.find(j => j.id === selectedReportId) : null,
  [selectedReportId, completedJobs]);

  // Find notes linked to this specific Job ID
  const relatedNotes = useMemo(() => {
    if (!selectedReportId) return [];
    return notes.filter(n => n.job_id === selectedReportId);
  }, [selectedReportId, notes]);

  const uniqueTypes = useMemo(() => 
    ['All Types', ...new Set(completedJobs.map(j => j.type || 'Maintenance'))], 
  [completedJobs]);

  // --- 3. MEMOIZED FILTERING ---
  const filteredHistory = useMemo(() => {
    return completedJobs.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const desc = item.desc || item.description || '';
      const date = item.created_at || item.date;
      const type = item.type || 'Maintenance';

      const matchesSearch = 
        item.vehicle.toLowerCase().includes(searchLower) ||
        desc.toLowerCase().includes(searchLower) ||
        item.id.toLowerCase().includes(searchLower);

      const matchesType = typeFilter === 'All Types' || type === typeFilter;

      let matchesDate = true;
      if (dateFilter !== 'All Time' && date) {
        const jobDate = new Date(date);
        const today = new Date();
        const diffTime = Math.abs(today - jobDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (dateFilter === 'Last 7 Days') matchesDate = diffDays <= 7;
        if (dateFilter === 'Last 30 Days') matchesDate = diffDays <= 30;
        if (dateFilter === 'Last 90 Days') matchesDate = diffDays <= 90;
      }

      return matchesSearch && matchesType && matchesDate;
    });
  }, [completedJobs, searchTerm, typeFilter, dateFilter]);

  // --- 4. MEMOIZED GROUPING ---
  const groupedHistory = useMemo(() => {
    const groups = {};
    filteredHistory.forEach(job => {
      const vId = job.vehicle || 'Unknown';
      if (!groups[vId]) groups[vId] = [];
      groups[vId].push(job);
    });
    // Sort keys alphabetically (e.g., V-101, V-102...)
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {});
  }, [filteredHistory]);

  // --- 5. AUTO-EXPAND EFFECT ---
  // If searching, open all folders so the user can see results.
  useEffect(() => {
    if (searchTerm) {
      const allGroupIds = Object.keys(groupedHistory).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setExpandedGroups(allGroupIds);
    } 
  }, [searchTerm, groupedHistory]);

  const toggleGroup = (vehicleId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [vehicleId]: !prev[vehicleId]
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maintenance History</h1>
          <p className="text-slate-500">Archive of completed services grouped by vehicle</p>
        </div>
        
        <button 
          onClick={() => setIsRangeModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all shadow-sm"
        >
          <Printer size={18} /> Export Report
        </button>
      </div>

      {/* CONTROLS BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search records..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-slate-200 pl-10 pr-8 py-2 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-50"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option>All Time</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
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
                <th className="px-6 py-4">Vehicle Group / Job ID</th>
                <th className="px-6 py-4">Service Details</th>
                <th className="px-6 py-4">Technician</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.keys(groupedHistory).length > 0 ? (
                Object.entries(groupedHistory).map(([vehicleId, jobs]) => {
                  const isExpanded = expandedGroups[vehicleId];

                  return (
                  <React.Fragment key={vehicleId}>
                    {/* --- 1. COLLAPSIBLE HEADER ROW --- */}
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
                          
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-slate-400">Last: {jobs[0]?.created_at ? new Date(jobs[0].created_at).toLocaleDateString() : 'N/A'}</span>
                            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm">
                              {jobs.length} Jobs
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* --- 2. EXPANDED JOB ROWS --- */}
                    {isExpanded && jobs.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors group animate-in slide-in-from-top-1 duration-200">
                        
                        {/* Job ID (Indented) */}
                        <td className="px-6 py-4 align-top w-48 pl-14 border-l-4 border-l-blue-100/50">
                           <div className="flex items-center gap-2 text-slate-500 font-mono text-xs mt-1">
                             <Hash size={12} className="text-slate-300" />
                             {record.id}
                           </div>
                        </td>

                        {/* Service Details */}
                        <td className="px-6 py-4 align-top w-2/5">
                          <div className="flex flex-col gap-1.5">
                            <span className={`self-start inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              (record.type === 'Urgent' || record.priority === 'High') 
                                ? 'bg-red-50 text-red-700 border border-red-100' 
                                : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}>
                              {record.type || record.priority || 'Maintenance'}
                            </span>
                            <p className="text-sm text-slate-600 line-clamp-2" title={record.desc || record.description}>
                              {record.desc || record.description}
                            </p>
                          </div>
                        </td>

                        {/* Technician */}
                        <td className="px-6 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                              {record.technician ? record.technician.charAt(0) : 'J'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-700">
                                {record.technician || 'Juan dela Cruz'}
                              </span>
                              <span className="text-xs text-slate-400 mt-0.5">
                                {record.created_at ? new Date(record.created_at).toLocaleDateString() : (record.date || 'N/A')}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 align-top text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedReportId(record.id); }}
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                            title="View Report"
                          >
                            <FileText size={20} />
                          </button>
                        </td>

                      </tr>
                    ))}
                  </React.Fragment>
                )})
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle size={24} className="text-slate-300" />
                      </div>
                      <p>No records found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}
      <ServiceReportModal 
        isOpen={!!selectedReportId}
        onClose={() => setSelectedReportId(null)}
        report={activeReport}
        relatedNotes={relatedNotes} // 🔥 PASS NOTES HERE
      />

      <DateRangeReportModal 
        isOpen={isRangeModalOpen}
        onClose={() => setIsRangeModalOpen(false)}
        jobs={completedJobs}
      />

    </div>
  );
};

export default History;