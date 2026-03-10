import React, { useState } from 'react';
import { Truck, AlertTriangle, Activity, Bell, BarChart3, ChevronRight, Gauge } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import VehicleDetailModal from '../../components/VehicleDetailModal';

const DispatcherDashboard = () => {
  // mileageStatus is added to the hook to track odometer-based health
  const { kpis, health, recentAlerts, mileageStatus } = useDashboardStats();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetail = (v) => {
    setSelectedVehicle(v);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-6 bg-slate-50/50">
      {/* 1. Header with Status Pill */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Fleet Overview</h1>
          <p className="text-sm font-medium text-slate-500">Real-time mileage & operational status</p>
        </div>
        <StatusPill />
      </div>

      {/* 2. KPI Section - Now featuring Mileage Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Units" value={kpis.activeVehicles} icon={<Truck size={20}/>} color="blue" />
        <StatCard title="Due for Service" value={mileageStatus?.dueCount || 0} icon={<Gauge size={20}/>} color="red" />
        <StatCard title="In Maintenance" value={kpis.activeJobs} icon={<Activity size={20}/>} color="orange" />
        <StatCard title="Total Alerts" value={kpis.unreadAlertsCount} icon={<Bell size={20}/>} color="slate" />
      </div>

      {/* 3. Visual Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Wear Distribution */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6 uppercase text-xs tracking-widest">
            <BarChart3 size={18} className="text-blue-500" /> Fleet Wear Distribution
          </h3>
          <div className="space-y-6">
            <HealthBar label="Optimal (0-75% Wear)" count={health.healthyCount} total={health.total} color="bg-green-500" />
            <HealthBar label="Warning (75-90% Wear)" count={health.maintenanceCount} total={health.total} color="bg-orange-400" />
            <HealthBar label="Critical (>90% Wear)" count={health.criticalCount} total={health.total} color="bg-red-500" />
          </div>
        </div>

        {/* Top Mileage Units Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase text-xs tracking-widest">
            <Gauge size={18} className="text-slate-400" /> High Usage Units
          </h3>
          <div className="space-y-4">
            {mileageStatus?.topVehicles?.map(v => (
              <div key={v.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                <span className="font-black text-slate-700">{v.id}</span>
                <span className="font-mono text-sm text-red-600 font-bold">{v.total_mileage?.toFixed(1)} KM</span>
              </div>
            ))}
            {(!mileageStatus?.topVehicles || mileageStatus.topVehicles.length === 0) && (
              <p className="text-xs text-slate-400 text-center py-4 italic">No high usage data available</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Interaction Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 font-bold text-slate-800 uppercase text-[10px] tracking-widest">Recent System Notifications</div>
            <div className="divide-y divide-slate-50">
              {recentAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className={`p-2 rounded-lg ${alert.type === 'Critical' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    <Bell size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-700">{alert.vehicle}</p>
                    <p className="text-xs text-slate-500">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-800 uppercase text-[10px] tracking-widest">Vehicle Watchlist</div>
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

// --- REUSABLE SUB-COMPONENTS ---

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100'
  };
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
        <div className={`p-2 rounded-xl border ${colors[color]}`}>{icon}</div>
      </div>
      <h3 className="text-3xl font-black text-slate-800 tabular-nums">{value}</h3>
    </div>
  );
};

const HealthBar = ({ label, count, total, color }) => (
  <div>
    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-2">
      <span>{label}</span>
      <span className="text-slate-800">{count} Units</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div 
        className={`${color} h-full rounded-full transition-all duration-1000`} 
        style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
      ></div>
    </div>
  </div>
);

const VehicleItem = ({ vehicle, onOpen }) => (
  <div 
    onClick={() => onOpen(vehicle)}
    className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/30 cursor-pointer hover:bg-red-100 transition-all group"
  >
    <div className="flex items-center gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
      <span className="font-black text-sm text-slate-800 uppercase">{vehicle.id}</span>
    </div>
    <ChevronRight size={14} className="text-red-300 group-hover:text-red-500" />
  </div>
);

const StatusPill = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full shadow-sm">
    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
    <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Live Fleet Sync</span>
  </div>
);

export default DispatcherDashboard;