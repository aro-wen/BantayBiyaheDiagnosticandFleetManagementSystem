import React, { useEffect } from 'react';
import { Search, Truck, MapPin, Gauge, Thermometer, Battery, Info, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import StatusBadge from '../../components/StatusBadge';
import VehicleDetailModal from '../../components/VehicleDetailModal'; 
import { getStatusColor } from '../../config/thresholds'; 
import { useFleetMonitoring } from '../../hooks/useFleetMonitoring';

// --- FIXED MAP RENDERING HELPER ---
// Ensures Leaflet tiles re-calculate size after container transitions
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 400); 
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// --- UPDATED MARKER LOGIC: SYNCED WITH ACTIVITY BADGE COLORS ---
const getMarkerIcon = (activity) => {
  const a = activity?.toLowerCase();
  // Color palette synced with your StatusBadge.jsx variants
  const colorClass = a === 'active' ? 'bg-green-500 shadow-green-500/50' : 
                     a === 'under maintenance' ? 'bg-amber-500 shadow-amber-500/50' : 
                     'bg-slate-400';

  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute w-full h-full bg-white rounded-full shadow-md border-2 border-slate-200"></div>
        <div class="absolute w-3.5 h-3.5 rounded-full ${colorClass} ${a === 'active' ? 'animate-pulse' : ''} shadow-lg"></div>
      </div>
    `,
    iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16]
  });
};

const DispatcherVehicles = () => {
  const { 
    filteredVehicles, searchTerm, setSearchTerm, 
    statusFilter, setStatusFilter, 
    selectedVehicle, isModalOpen, openModal, closeModal, mapKey 
  } = useFleetMonitoring();

  // --- UPDATED STATS LOGIC: TARGETS ACTIVITY COLUMN ---
  const stats = {
    total: filteredVehicles.length,
    active: filteredVehicles.filter(v => v.activity?.toLowerCase() === 'active').length,
    maintenance: filteredVehicles.filter(v => v.activity?.toLowerCase() === 'under maintenance').length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Fleet Operations</h1>
          <p className="text-slate-500 text-sm font-medium">Real-time status tracking for BantayBiyahe units</p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Total Fleet" value={stats.total} icon={<Truck size={20}/>} color="text-blue-600" />
        <SummaryCard label="Active Now" value={stats.active} icon={<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>} color="text-green-600" />
        <SummaryCard label="In Maintenance" value={stats.maintenance} icon={<Info size={20}/>} color="text-amber-600" />
      </div>

      {/* LIVE MAP SECTION */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative z-0">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-semibold text-slate-700 flex items-center text-xs uppercase tracking-wider">
            <MapPin size={18} className="mr-2 text-blue-600" /> Live Fleet Map
          </h2>
        </div>
        
        <div className="h-[380px] w-full z-0">
          <MapContainer center={[14.5813, 120.9930]} zoom={13} className="h-full w-full z-0">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredVehicles.map((vehicle) => (
              vehicle.lat && vehicle.lng && (
                <Marker 
                  key={vehicle.id} 
                  position={[vehicle.lat, vehicle.lng]} 
                  icon={getMarkerIcon(vehicle.activity)} 
                >
                  <Popup>
                    <div className="text-center p-1">
                      <div className="font-bold text-slate-800 text-base uppercase">{vehicle.id}</div>
                      <div className="text-[10px] font-medium text-slate-400 uppercase mb-2 border-b pb-1">{vehicle.plate}</div>
                      <div className="text-[9px] font-bold text-cyan-600 uppercase mb-0.5">Current Address</div>
                      <div className="text-xs font-semibold mb-2 truncate max-w-[150px] uppercase">
                        {vehicle.current_address || 'STATIONARY'}
                      </div>
                      <button onClick={() => openModal(vehicle)} className="w-full bg-blue-600 text-white text-[10px] font-bold uppercase py-2.5 rounded-lg hover:bg-blue-700 transition-all">
                        Launch Telemetry
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
            <MapResizer />
          </MapContainer>
        </div>
      </section>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col lg:flex-row gap-3 w-full bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={20} />
          <input 
            type="text" 
            placeholder="Search ID or Plate..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold shadow-inner transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {['all', 'active', 'under maintenance', 'inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* VEHICLE MONITORING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} onClick={() => openModal(vehicle)} />
        ))}
      </div>

      {/* Detail Modal integration  */}
      <VehicleDetailModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        vehicle={selectedVehicle} 
        mapKey={mapKey} 
      />
    </div>
  );
};

const SummaryCard = ({ label, value, icon, color }) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
    <div className="p-3 bg-slate-50 rounded-xl text-slate-400">{icon}</div>
  </div>
);

const VehicleCard = ({ vehicle, onClick }) => (
  <div onClick={onClick} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          vehicle.activity?.toLowerCase() === 'active' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'
        }`}>
          <Truck size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 uppercase tracking-tight leading-none mb-1">{vehicle.id}</h3>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">{vehicle.plate}</p>
        </div>
      </div>
      <StatusBadge type={vehicle.activity} />
    </div>
    
    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 bg-slate-50/20 rounded-lg">
      <TelemetryItem label="Speed" val={vehicle.speed} unit="KM/H" color="text-slate-700" icon={<Gauge size={12}/>} />
      <TelemetryItem label="Temp" val={vehicle.temp} unit="°" color={getStatusColor(vehicle.temp, 'TEMP')} icon={<Thermometer size={12}/>} />
      <TelemetryItem label="Batt" val={vehicle.battery} unit="V" color={getStatusColor(vehicle.battery, 'BATTERY')} icon={<Battery size={12}/>} />
    </div>

    <div className="pt-4 space-y-2.5">
      <AddressItem label="Current Position" address={vehicle.current_address} dotColor="bg-cyan-500" />
      <AddressItem label="Approaching Stop" address={vehicle.next_address} dotColor="bg-amber-500" />
    </div>
  </div>
);

const TelemetryItem = ({ label, val, unit, color, icon }) => (
  <div className="text-center">
    <div className="flex justify-center text-slate-300 mb-0.5">{icon}</div>
    <div className={`text-sm font-black font-mono leading-none ${color}`}>{val || 0}<span className="text-[10px] ml-0.5">{unit}</span></div>
    <div className="text-[8px] font-bold text-slate-400 uppercase mt-1">{label}</div>
  </div>
);

const AddressItem = ({ label, address, dotColor }) => (
  <div className="flex items-start gap-2.5">
    <div className={`mt-1.5 h-1.5 w-1.5 rounded-full ${dotColor} shadow-sm`} />
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">{label}</p>
      <p className="text-[11px] font-semibold text-slate-600 truncate uppercase tracking-tight">{address || 'STATIONARY'}</p>
    </div>
  </div>
);

export default DispatcherVehicles;