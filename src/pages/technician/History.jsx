// src/pages/technician/History.jsx

import React, { useState, useMemo } from 'react';
import { Search, Calendar, Filter, FileText, CheckCircle, ChevronDown, Printer } from 'lucide-react'; // Added Printer
import { useJobs } from '../../contexts/JobContext';
import ServiceReportModal from '../../components/ServiceReportModal';
import DateRangeReportModal from '../../components/DateRangeReportModal'; // Import new modal

const History = () => {
  const { jobs } = useJobs();
  
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [selectedReport, setSelectedReport] = useState(null);
  
  // NEW STATE FOR RANGE MODAL
  const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);

  // ... (Keep your useMemo and filter logic exactly the same) ...
  // [Paste your existing filter logic here]
  const completedJobs = useMemo(() => 
    jobs.filter(j => j.status === 'Completed').sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)), 
  [jobs]);

  const uniqueTypes = useMemo(() => 
    ['All Types', ...new Set(completedJobs.map(j => j.type || 'Maintenance'))], 
  [completedJobs]);

  const filteredHistory = completedJobs.filter(item => {
    // ... [Your existing matching logic] ...
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

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Main Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maintenance History</h1>
          <p className="text-slate-500">Archive of all completed service records</p>
        </div>
        
        {/* NEW BUTTON FOR SUMMARY REPORT */}
        <button 
          onClick={() => setIsRangeModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all shadow-sm"
        >
          <Printer size={18} /> Generate Report
        </button>
      </div>

      {/* ... (Keep your Search & Filter Controls exactly the same) ... */}
      
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* ... Search Input ... */}
         <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Job ID, Vehicle, or Description..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 w-full md:w-auto">
             {/* ... Your Filter Selects ... */}
             <div className="relative">
            <select 
              className="appearance-none bg-white border border-slate-200 pl-10 pr-8 py-2 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-50 transition-colors"
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
              className="appearance-none bg-white border border-slate-200 pl-10 pr-8 py-2 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-50 transition-colors"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <Filter className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* ... (Keep your Table exactly the same) ... */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                <th className="px-6 py-4">Job ID</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 w-1/3">Description</th>
                <th className="px-6 py-4">Technician</th>
                <th className="px-6 py-4">Date Completed</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {record.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800">{record.vehicle}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${
                        (record.type === 'Urgent' || record.priority === 'High') 
                          ? 'bg-red-50 text-red-700 border-red-100' 
                          : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {record.type || record.priority || 'Maintenance'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-xs" title={record.desc || record.description}>
                      {record.desc || record.description}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {record.technician ? record.technician.charAt(0) : 'J'}
                        </div>
                        <span className="text-sm text-slate-600">
                          {record.technician || 'Juan dela Cruz'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                      {record.created_at 
                        ? new Date(record.created_at).toLocaleDateString() 
                        : (record.date || 'N/A')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedReport(record)}
                        className="inline-flex items-center px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                      >
                        <FileText size={14} className="mr-1.5" /> View Report
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle size={24} className="text-slate-300" />
                      </div>
                      <p>No completed maintenance records found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- SINGLE REPORT MODAL --- */}
      <ServiceReportModal 
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
      />

      {/* --- NEW: DATE RANGE REPORT MODAL --- */}
      <DateRangeReportModal 
        isOpen={isRangeModalOpen}
        onClose={() => setIsRangeModalOpen(false)}
        jobs={completedJobs}
      />

    </div>
  );
};

export default History;