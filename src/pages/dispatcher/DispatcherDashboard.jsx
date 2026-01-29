import React, { useState } from 'react';
import { Truck, CheckCircle, AlertTriangle, Search, ChevronDown } from 'lucide-react';
import { useJobs } from '../../contexts/JobContext'; // <--- Import

const DispatcherDashboard = () => {
  const { vehicles } = useJobs(); // <--- Use Global Data

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [availFilter, setAvailFilter] = useState('All Availability');

  // KPI Calculations
  const totalVehicles = vehicles.length;
  const normalCount = vehicles.filter(v => v.status === 'Normal').length;
  const warningCount = vehicles.filter(v => v.status === 'Warning').length;
  const criticalCount = vehicles.filter(v => v.status === 'Critical').length;

  // Filter Logic
  const filteredData = vehicles.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.plate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter; // Note: 'status' in context vs 'health' in mock
    const matchesAvail = availFilter === 'All Availability' || item.avail === availFilter;
    
    return matchesSearch && matchesStatus && matchesAvail;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Fleet Overview</h1>
        <p className="text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <OverviewCard 
          title="Total Vehicles" 
          value={totalVehicles} 
          subtext="Fleet size" 
          icon={<Truck size={20} />} 
          type="default"
        />
        <OverviewCard 
          title="Normal Status" 
          value={normalCount} 
          subtext="Operating normally" 
          icon={<CheckCircle size={20} />} 
          type="success"
        />
        <OverviewCard 
          title="Warning Status" 
          value={warningCount} 
          subtext="Needs attention" 
          icon={<AlertTriangle size={20} />} 
          type="warning"
        />
        <OverviewCard 
          title="Critical Status" 
          value={criticalCount} 
          subtext="Immediate action required" 
          icon={<AlertTriangle size={20} />} 
          type="critical"
        />
      </div>

      {/* 3. FLEET VEHICLES SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Title & Controls */}
        <div className="p-6 pb-0">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Fleet Vehicles</h2>
          
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by Vehicle ID or Plate..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative">
                <select 
                  className="appearance-none bg-slate-50 pl-4 pr-10 py-2 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Status</option>
                  <option>Normal</option>
                  <option>Warning</option>
                  <option>Critical</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select 
                  className="appearance-none bg-slate-50 pl-4 pr-10 py-2 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100"
                  value={availFilter}
                  onChange={(e) => setAvailFilter(e.target.value)}
                >
                  <option>All Availability</option>
                  <option>Available</option>
                  <option>Under Maintenance</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Vehicle ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Plate Number</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Health Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">MIL Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">GPS Location</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-right">Last Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">{row.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.plate}</td>
                  <td className="px-6 py-4">
                    <StatusBadge type={row.health} />
                  </td>
                  <td className="px-6 py-4">
                    {row.mil === 'ON' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">ON</span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">OFF</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                    {row.lat}, {row.lng}
                  </td>
                  <td className="px-6 py-4">
                    <AvailabilityBadge status={row.avail} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 text-right">{row.update}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
             <div className="p-12 text-center text-slate-400 text-sm">No vehicles found.</div>
          )}
        </div>
      </div>

    </div>
  );
};

// --- SUB-COMPONENTS ---

const OverviewCard = ({ title, value, subtext, icon, type }) => {
  const styles = {
    default: { text: 'text-slate-800', bg: 'bg-slate-100 text-slate-600' },
    success: { text: 'text-green-600', bg: 'bg-green-100 text-green-600' },
    warning: { text: 'text-yellow-600', bg: 'bg-yellow-100 text-yellow-600' },
    critical: { text: 'text-red-600', bg: 'bg-red-100 text-red-600' },
  };

  const theme = styles[type] || styles.default;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <span className="text-slate-500 text-sm font-medium">{title}</span>
        <div className={`p-1.5 rounded-lg ${theme.bg}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className={`text-3xl font-bold ${theme.text}`}>{value}</div>
        <div className="text-xs text-slate-400 mt-1">{subtext}</div>
      </div>
    </div>
  );
};

const StatusBadge = ({ type }) => {
  const styles = {
    Normal: 'bg-green-50 text-green-700 border-green-200',
    Warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Critical: 'bg-red-50 text-red-700 border-red-200',
  };

  const icons = {
    Normal: <CheckCircle size={12} className="mr-1.5" />,
    Warning: <AlertTriangle size={12} className="mr-1.5" />,
    Critical: <AlertTriangle size={12} className="mr-1.5" />,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[type]}`}>
      {icons[type]}
      {type}
    </span>
  );
};

const AvailabilityBadge = ({ status }) => {
  const isAvailable = status === 'Available';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      isAvailable 
        ? 'border-green-200 text-green-700' 
        : 'border-orange-200 text-orange-700'
    }`}>
      {status}
    </span>
  );
};

export default DispatcherDashboard;