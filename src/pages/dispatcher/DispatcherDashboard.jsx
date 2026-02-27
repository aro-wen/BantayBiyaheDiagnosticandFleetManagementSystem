import React, { useState } from 'react';
import { Truck, AlertTriangle, Activity, Bell, BarChart3, ChevronRight } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import VehicleDetailModal from '../../components/VehicleDetailModal';
import MaintenanceWidget from '../../components/MaintenanceWidget';

const DispatcherDashboard = () => {
  const { kpis, health, recentAlerts } = useDashboardStats();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetail = (v) => {
    setSelectedVehicle(v);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-6">
      {/* 1. Header with Status Pill */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Fleet Overview</h1>
          <p className="text-sm font-medium text-slate-500">Real-time operational status for BantayBiyahe</p>
        </div>
        <StatusPill />
      </div>

      {/* 2. KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Vehicles" value={kpis.activeVehicles} icon={<Truck size={20}/>} color="blue" />
        <StatCard title="Critical Issues" value={kpis.criticalCount} icon={<AlertTriangle size={20}/>} color="red" />
        <StatCard title="Active Jobs" value={kpis.activeJobs} icon={<Activity size={20}/>} color="orange" />
        <StatCard title="Unread Alerts" value={kpis.unreadAlertsCount} icon={<Bell size={20}/>} color="slate" />
      </div>

      {/* 3. Visual Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-blue-500" /> Engine Health Status
          </h3>
          <div className="space-y-6">
            <HealthBar label="Healthy" count={health.healthyCount} total={health.total} color="bg-green-500" />
            <HealthBar label="In Service" count={health.maintenanceCount} total={health.total} color="bg-orange-400" />
            <HealthBar label="Critical" count={health.criticalCount} total={health.total} color="bg-red-500" />
          </div>
        </div>
        <MaintenanceWidget />
      </div>

      {/* 4. Interaction Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
           <div className="p-4 border-b border-slate-100 font-bold text-slate-800">Recent Notifications</div>
           <div className="divide-y divide-slate-50">
             {recentAlerts.map((alert) => (
               <div key={alert.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                 <div className={`p-2 rounded-lg ${alert.type === 'Critical' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                   <Bell size={16} />
                 </div>
                 <div className="flex-1">
                   <p className="text-sm font-bold text-slate-700">{alert.vehicle}</p>
                   <p className="text-xs text-slate-500">{alert.message}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-800">Critical Vehicles</div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[300px]">
            {health.critical.map(v => (
              <VehicleItem key={v.id} vehicle={v} onOpen={handleOpenDetail} />
            ))}
          </div>
        </div>
      </div>

      <VehicleDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} vehicle={selectedVehicle} />
    </div>
  );
};

// --- SUB-COMPONENTS FOR CLEANER CODE ---

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    slate: 'bg-slate-100 text-slate-600'
  };
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  );
};

const HealthBar = ({ label, count, total, color }) => (
  <div>
    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
      <span>{label}</span>
      <span className="font-bold text-slate-700">{count} Units</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
      <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${(count / total) * 100}%` }}></div>
    </div>
  </div>
);

const VehicleItem = ({ vehicle, onOpen }) => (
  <div 
    onClick={() => onOpen(vehicle)}
    className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/50 cursor-pointer hover:bg-red-100 transition-colors group"
  >
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
      <span className="font-bold text-sm text-slate-800">{vehicle.id}</span>
    </div>
    <ChevronRight size={16} className="text-red-300 group-hover:text-red-500 transition-colors" />
  </div>
);

const StatusPill = () => (
  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-100 rounded-full">
    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
    <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">System Online</span>
  </div>
);

export default DispatcherDashboard;