import React, { useState } from 'react';
import { useMaintenanceData } from '../../hooks/useMaintenanceData';
import { CheckCircle2, Gauge } from 'lucide-react';
import MaintenanceResetModal from '../../components/MaintenanceResetModal';

const MileageChecker = () => {
  // useMaintenanceData should now return the joined tracking data
  const { vehicles, loading } = useMaintenanceData(''); 
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const MAINTENANCE_PARTS = [
    { name: "Oil Change", limit: 5000, key: "last_oil_change_odo" },
    { name: "Tire Rotation", limit: 10000, key: "last_tire_rotation_odo" },
    { name: "Brake Inspection", limit: 15000, key: "last_brake_service_odo" }
  ];

  const handleOpenReset = (v) => {
    setSelectedVehicle(v);
    setIsResetModalOpen(true);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mileage Checker</h1>
          <p className="text-slate-500 text-sm font-medium">Distance-based wear tracking via GPS coordinates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div key={v.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{v.id}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  v.trip_direction === 'Return' ? 'bg-blue-100 text-blue-600' : 'bg-cyan-100 text-cyan-600'
                }`}>
                  {v.trip_direction} Bound
                </span>
              </div>
              <CheckCircle2 className="text-green-500" size={24}/>
            </div>

            <div className="mb-6 flex justify-between items-end p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Odometer</span>
              <span className="text-2xl font-mono font-bold text-slate-800 tabular-nums">
                {(v.total_mileage || 0).toFixed(1)} <small className="text-xs text-slate-400 font-sans">KM</small>
              </span>
            </div>

            <div className="space-y-6">
              {MAINTENANCE_PARTS.map((part) => {
                // Calculate distance since the SPECIFIC last service baseline
                const lastServiceOdo = v.maintenance_tracking?.[part.key] || 0;
                const distanceSinceService = Math.max((v.total_mileage || 0) - lastServiceOdo, 0);
                
                const percentage = Math.min((distanceSinceService / part.limit) * 100, 100);
                const remaining = Math.max(part.limit - distanceSinceService, 0);

                return (
                  <div key={part.name} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">{part.name}</span>
                      <span className={percentage > 90 ? 'text-red-500 animate-pulse' : 'text-slate-600'}>
                        {remaining.toFixed(0)} KM LEFT
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          percentage > 90 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                          percentage > 75 ? 'bg-amber-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => handleOpenReset(v)}
              className="mt-8 w-full py-4 bg-slate-900 hover:bg-cyan-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
            >
              <Gauge size={14} /> Log Maintenance Reset
            </button>
          </div>
        ))}
      </div>

      {/* The Specialized Modal for Mileage Resets */}
      <MaintenanceResetModal 
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        vehicleId={selectedVehicle?.id}
        currentOdo={selectedVehicle?.total_mileage}
        onJobCreated={(msg) => console.log(msg)} // Replace with toast logic
      />
    </div>
  );
};

export default MileageChecker;