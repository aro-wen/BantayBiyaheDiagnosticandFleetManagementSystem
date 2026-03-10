import React from 'react';
import { useMaintenanceData } from '../../hooks/useMaintenanceData';
import { Info } from 'lucide-react';

const TechnicianMileage = () => {
  // Pulling the joined vehicle and tracking data
  const { vehicles, loading } = useMaintenanceData(''); 

  const MAINTENANCE_PARTS = [
    { name: "Oil Change", limit: 5000, key: "last_oil_change_odo" },
    { name: "Tire Rotation", limit: 10000, key: "last_tire_rotation_odo" },
    { name: "Brake Inspection", limit: 15000, key: "last_brake_service_odo" }
  ];

  if (loading) return <div className="p-10 text-center text-sm font-bold text-slate-400">Loading Fleet Data...</div>;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mileage Checker</h1>
        <p className="text-sm font-medium text-slate-500">Distance-based wear tracking via GPS coordinates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div key={v.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{v.id}</h3>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                v.activity === 'Under Maintenance' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
              }`}>
                {v.activity}
              </div>
            </div>

            {/* Current Odometer Display */}
            <div className="mb-6 p-4 bg-slate-900 rounded-2xl text-white flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Current KM</span>
              <span className="text-xl font-mono font-bold tabular-nums">
                {(v.total_mileage || 0).toFixed(1)}
              </span>
            </div>

            <div className="space-y-5">
              {MAINTENANCE_PARTS.map((part) => {
                const lastService = v.maintenance_tracking?.[part.key] || 0;
                const distanceSince = Math.max((v.total_mileage || 0) - lastService, 0);
                const percentage = Math.min((distanceSince / part.limit) * 100, 100);
                const remaining = Math.max(part.limit - distanceSince, 0);

                return (
                  <div key={part.name} className="group">
                    <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                      <span className="text-slate-400">{part.name}</span>
                      <span className={percentage > 90 ? 'text-red-500' : 'text-slate-800'}>
                        {remaining.toFixed(0)} KM UNTIL DUE
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ${
                          percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-orange-400' : 'bg-blue-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-400">
              <Info size={14} />
              <p className="text-[10px] font-medium leading-tight">
                Complete the assigned job in the 'Tasks' tab to reset these values.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicianMileage;