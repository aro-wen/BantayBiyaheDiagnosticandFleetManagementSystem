import React, { useState, useMemo } from 'react';
import { Search, Calendar, Filter, CheckCircle, FileText } from 'lucide-react';
import { useJobs } from '../../contexts/JobContext';
import ServiceReportModal from '../../components/ServiceReportModal'; // <--- Import New Component

const History = () => {
  const { jobs } = useJobs();
  
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [selectedReport, setSelectedReport] = useState(null); // Stores the specific job object

  // --- 1. GET DATA ---
  const completedJobs = useMemo(() => 
    jobs.filter(j => j.status === 'Completed').sort((a, b) => new Date(b.date) - new Date(a.date)), 
  [jobs]);

  // --- 2. DYNAMIC OPTIONS ---
  const uniqueTypes = useMemo(() => 
    ['All Types', ...new Set(completedJobs.map(j => j.type))], 
  [completedJobs]);

  // --- 3. FILTER LOGIC ---
  const filteredHistory = completedJobs.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      item.vehicle.toLowerCase().includes(searchLower) ||
      item.desc.toLowerCase().includes(searchLower) ||
      item.id.toLowerCase().includes(searchLower);

    const matchesType = typeFilter === 'All Types' || item.type === typeFilter;

    let matchesDate = true;
    if (dateFilter !== 'All Time') {
      const jobDate = new Date(item.date);
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
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Maintenance History</h1>
        <p className="text-slate-500">Archive of all completed service records</p>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Job ID, Vehicle, or Description..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative">
            <select 
              className="appearance-none bg-slate-50 border-none pl-10 pr-8 py-2 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option>All Time</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>

          <div className="relative">
            <select 
              className="appearance-none bg-slate-50 border-none pl-10 pr-8 py-2 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <Filter className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((record) => (
            <div key={record.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                
                {/* Left: Info */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 text-green-600 rounded-full mt-1">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-slate-800">{record.vehicle}</h3>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">
                        {record.id}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${
                        record.type === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {record.type}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">{record.desc}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>Completed by: <span className="text-slate-600 font-semibold">Juan dela Cruz</span></span>
                      <span>•</span>
                      <span>{record.date}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <button 
                  onClick={() => setSelectedReport(record)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center justify-center"
                >
                  <FileText size={16} className="mr-2" />
                  View Report
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <h3 className="text-lg font-semibold text-slate-600">No History Found</h3>
            <p className="text-slate-400 text-sm">No records match your filters.</p>
          </div>
        )}
      </div>

      {/* --- RENDER THE NEW COMPONENT --- */}
      <ServiceReportModal 
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
      />

    </div>
  );
};

export default History;