import React from 'react';
import { 
  AlertTriangle, CheckCircle, Clock, Truck, 
  Activity, ChevronRight, BarChart3 
} from 'lucide-react';
import { useJobs } from '../../contexts/JobContext';
import { Link } from 'react-router-dom';
// Ensure this path matches where you created the widget
import MaintenanceWidget from '../../components//MaintenanceWidget'; 

const DispatcherDashboard = () => {
  // 1. Get Live Stats and Data
  const { stats, alerts, vehicles } = useJobs();

  // 2. Prepare "Critical Vehicles" list (Case insensitive check)
  const criticalVehicles = vehicles.filter(v => 
    ['critical', 'warning', 'maintenance'].includes(v.status?.toLowerCase())
  );

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

      {/* KPI Cards (CONNECTED TO LIVE DATA) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Active Vehicles" 
          value={stats.activeVehicles || 0} 
          subtitle="On the road" 
          icon={<Truck size={20} />} 
          color="blue" 
        />
        <StatCard 
          title="Critical Issues" 
          value={stats.criticalVehicles || 0} 
          subtitle="Requires attention" 
          icon={<AlertTriangle size={20} />} 
          color="red" 
        />
        <StatCard 
          title="Active Jobs" 
          value={(stats.inProgress || 0) + (stats.pending || 0)} 
          subtitle="Maintenance tasks" 
          icon={<Activity size={20} />} 
          color="orange" 
        />
        <StatCard 
          title="Unread Alerts" 
          value={stats.unreadAlerts || 0} 
          subtitle="New notifications" 
          icon={<Clock size={20} />} 
          color="slate" 
        />
      </div>

      {/* MIDDLE SECTION: Charts & Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
        {/* Fleet Status Overview (Placeholder for a Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-slate-400" />
              Fleet Status Distribution
            </h3>
          </div>
          
          {/* Simple Visual Bar to replace the empty chart */}
          <div className="flex-1 flex flex-col justify-center gap-6">
             {/* Status Bar: Normal */}
             <div>
               <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                 <span>Normal Operation</span>
                 <span>{vehicles.filter(v => v.status === 'Normal' || v.status === 'Active').length} Vehicles</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                 <div className="bg-green-500 h-full rounded-full" style={{ width: '75%' }}></div>
               </div>
             </div>

             {/* Status Bar: Maintenance */}
             <div>
               <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                 <span>In Maintenance</span>
                 <span>{vehicles.filter(v => v.status === 'Maintenance').length} Vehicles</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                 <div className="bg-orange-400 h-full rounded-full" style={{ width: '15%' }}></div>
               </div>
             </div>

             {/* Status Bar: Critical */}
             <div>
               <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                 <span>Critical / Offline</span>
                 <span>{criticalVehicles.length} Vehicles</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                 <div className="bg-red-500 h-full rounded-full" style={{ width: '5%' }}></div>
               </div>
             </div>
          </div>
        </div>

        {/* NEW: Maintenance Widget (Takes up 1 column on the right) */}
        <div className="lg:col-span-1">
           <MaintenanceWidget />
        </div>

      </div>

      {/* BOTTOM SECTION: Alerts & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Alerts (Live Data) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Alerts</h3>
            <Link to="/dispatcher/alerts" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {alerts && alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                <div className={`mt-1 p-2 rounded-lg ${
                  alert.priority === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
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

        {/* Right Column: Critical Vehicle List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Critical Vehicles</h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[300px]">
            {criticalVehicles.length > 0 ? (
              <div className="space-y-3">
                {criticalVehicles.map(v => (
                  <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-sm text-slate-800">{v.id}</span>
                        <span className="text-xs font-bold text-red-600 uppercase">{v.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{v.plate || 'No Plate'}</p>
                    </div>
                    <Link to={`/dispatcher/vehicles/${v.id}`}>
                      <ChevronRight size={16} className="text-red-300 hover:text-red-500 cursor-pointer" />
                    </Link>
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