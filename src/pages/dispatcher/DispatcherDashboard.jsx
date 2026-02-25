import React, { useState } from 'react';
import { 
  AlertTriangle, CheckCircle, Clock, Truck, 
  Activity, ChevronRight, BarChart3 
} from 'lucide-react';
import { useJobs } from '../../contexts/JobContext';
import { Link } from 'react-router-dom';
import MaintenanceWidget from '../../components/MaintenanceWidget'; 
// 1. IMPORT THE MODAL
import VehicleDetailModal from '../../components/VehicleDetailModal';

const DispatcherDashboard = () => {
  const { vehicles, alerts, jobs, drivers } = useJobs();

  // --- MODAL STATE ---
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to open modal
  const handleOpenVehicleDetail = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  // --- KPI LOGIC ---
  const activeVehiclesCount = drivers.filter(d => 
    d.status === 'Active' && d.vehicle && d.vehicle !== 'Not assigned'
  ).length;

  const activeJobsCount = jobs.filter(j => 
    ['In Progress', 'Pending'].includes(j.status)
  ).length;

  const unreadAlertsCount = alerts.filter(a => 
    a.status === 'Unread'
  ).length;

  // --- CHART LOGIC ---
  const criticalVehicles = vehicles.filter(v => 
    ['critical', 'warning', 'offline'].includes(v.status?.toLowerCase())
  );
  
  const healthyVehiclesCount = vehicles.filter(v => 
    ['normal', 'idle', 'active'].includes(v.status?.toLowerCase())
  ).length;

  const maintenanceVehiclesCount = vehicles.filter(v => 
    v.status?.toLowerCase() === 'maintenance'
  ).length;


  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fleet Overview</h1>
          <p className="text-slate-500">Real-time operational status</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            System Online
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Active Vehicles" 
          value={activeVehiclesCount} 
          subtitle="On the road" 
          icon={<Truck size={20} />} 
          color="blue" 
        />
        <StatCard 
          title="Critical Issues" 
          value={criticalVehicles.length} 
          subtitle="Requires attention" 
          icon={<AlertTriangle size={20} />} 
          color="red" 
        />
        <StatCard 
          title="Active Jobs" 
          value={activeJobsCount} 
          subtitle="Maintenance tasks" 
          icon={<Activity size={20} />} 
          color="orange" 
        />
        <StatCard 
          title="Unread Alerts" 
          value={unreadAlertsCount} 
          subtitle="New notifications" 
          icon={<Clock size={20} />} 
          color="slate" 
        />
      </div>

      {/* MIDDLE SECTION: Charts & Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
        {/* Fleet Status Overview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-slate-400" />
              Engine Health Distribution
            </h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center gap-6">
             {/* Status Bar: Normal */}
             <div>
               <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                 <span>Healthy / Nominal</span>
                 <span>{healthyVehiclesCount} Vehicles</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                 <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${(healthyVehiclesCount / Math.max(vehicles.length, 1)) * 100}%` }}></div>
               </div>
             </div>

             {/* Status Bar: Maintenance */}
             <div>
               <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                 <span>In Shop / Maintenance</span>
                 <span>{maintenanceVehiclesCount} Vehicles</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                 <div className="bg-orange-400 h-full rounded-full transition-all duration-500" style={{ width: `${(maintenanceVehiclesCount / Math.max(vehicles.length, 1)) * 100}%` }}></div>
               </div>
             </div>

             {/* Status Bar: Critical */}
             <div>
               <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                 <span>Critical Faults</span>
                 <span>{criticalVehicles.length} Vehicles</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                 <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${(criticalVehicles.length / Math.max(vehicles.length, 1)) * 100}%` }}></div>
               </div>
             </div>
          </div>
        </div>

        {/* Maintenance Widget */}
        <div className="lg:col-span-1">
           <MaintenanceWidget />
        </div>

      </div>

      {/* BOTTOM SECTION: Alerts & Critical List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Alerts</h3>
            <Link to="/dispatcher/alerts" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {alerts && alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                <div className={`mt-1 p-2 rounded-lg ${
                  alert.type === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-slate-800 text-sm">{alert.vehicle}</h4>
                    <span className="text-xs text-slate-400">
                      {new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{alert.message}</p>
                </div>
              </div>
            ))}
            {(!alerts || alerts.length === 0) && (
              <div className="p-8 text-center text-slate-400 text-sm">No active alerts. System nominal.</div>
            )}
          </div>
        </div>

        {/* Right Column: Critical Vehicle List (UPDATED) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Critical Vehicles</h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[300px]">
            {criticalVehicles.length > 0 ? (
              <div className="space-y-3">
                {criticalVehicles.map(v => (
                  // 🔥 UPDATED: Click handler added here instead of Link
                  <div 
                    key={v.id} 
                    onClick={() => handleOpenVehicleDetail(v)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors group"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-sm text-slate-800">{v.id}</span>
                        <span className="text-xs font-bold text-red-600 uppercase">{v.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{v.plate || 'No Plate'}</p>
                    </div>
                    {/* Icon is now just visual, action is handled by parent div */}
                    <ChevronRight size={16} className="text-red-300 group-hover:text-red-500 transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
                <p className="text-sm font-medium text-slate-800">All Systems Nominal</p>
                <p className="text-xs text-slate-500 mt-1">No vehicles are reporting critical errors.</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <Link to="/dispatcher/vehicles" className="w-full py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 flex items-center justify-center hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm">
              View All Vehicles
            </Link>
          </div>
        </div>

      </div>

      {/* 2. ADD THE MODAL COMPONENT */}
      <VehicleDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicle={selectedVehicle}
      />

    </div>
  );
};

// Helper for KPI Cards
const StatCard = ({ title, value, subtitle, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
    </div>
  );
};

export default DispatcherDashboard;