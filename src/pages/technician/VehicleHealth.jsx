import React, { useEffect, useState } from 'react';
import { 
  Search, Bus, MapPin, Gauge, CheckCircle, AlertOctagon, Activity, Loader2 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import StatusBadge from '../../components/StatusBadge';
import VehicleDetailModal from '../../components/VehicleDetailModal_Dispatcher'; 
import { getStatusColor } from '../../config/thresholds'; 
import { useFleetMonitoring } from '../../hooks/useFleetMonitoring';
// Import your provided hook
import { useVehicleData } from '../../hooks/useVehicleData'; 

// --- FIXED MAP RENDERING HELPER ---
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

// --- AUTO-PAN CONTROLLER ---
function MapFollower({ selectedVehicle }) {
  const map = useMap();
  useEffect(() => {
    if (selectedVehicle?.lat && selectedVehicle?.lng) {
      map.flyTo([selectedVehicle.lat, selectedVehicle.lng], 15, {
        animate: true,
        duration: 1.5
      });
    }
  }, [selectedVehicle?.lat, selectedVehicle?.lng, map]);
  return null;
}

// --- DYNAMIC MARKER LOGIC ---
const getMarkerIcon = (activity, status) => {
  const act = activity?.toLowerCase();
  const stat = status?.toLowerCase();

  const activityColors = {
    active: 'border-blue-500 bg-blue-50 text-blue-600',
    'under maintenance': 'border-amber-500 bg-amber-50 text-amber-600',
    inactive: 'border-slate-300 bg-slate-50 text-slate-400'
  };

  const statusColors = {
    critical: 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]',
    warning: 'bg-amber-500',
    normal: 'bg-green-500'
  };

  const currentActStyle = activityColors[act] || activityColors.inactive;
  const currentStatStyle = statusColors[stat] || statusColors.normal;

  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 ${act === 'active' ? 'animate-pulse' : ''}">
        <div class="absolute w-full h-full ${currentActStyle} rounded-xl border-2 shadow-lg flex items-center justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
             <path d="M8 6v6"/><path d="M16 6v6"/><path d="M12 12v3"/><path d="M16 12v3"/><path d="M8 12v3"/><path d="M10 18h4"/><path d="M19 12h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1"/><path d="M4 12H3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1"/><path d="M6 18H4v-3"/><path d="M20 18h-2v-3"/><path d="M17 3H7a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4Z"/>
           </svg>
        </div>
        <div class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-white ${currentStatStyle} z-10 shadow-sm"></div>
        <div class="absolute -bottom-1 w-2.5 h-2.5 ${act === 'active' ? 'bg-blue-500' : 'bg-slate-400'} rotate-45 -z-10"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 42],
    popupAnchor: [0, -42]
  });
};

const DispatcherVehicles = () => {
  const { 
    filteredVehicles, searchTerm, setSearchTerm, 
    statusFilter, setStatusFilter, 
    selectedVehicle, isModalOpen, openModal, closeModal, mapKey 
  } = useFleetMonitoring();

  const [isFollowing, setIsFollowing] = useState(false);

  const stats = {
    total: filteredVehicles.length,
    active: filteredVehicles.filter(v => v.activity?.toLowerCase() === 'active').length,
    critical: filteredVehicles.filter(v => v.status?.toLowerCase() === 'critical').length
  };

  useEffect(() => {
    if (!selectedVehicle) setIsFollowing(false);
  }, [selectedVehicle]);

  return (
    <div className="space-y-6 animate-fade-in p-1 md:p-0">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Fleet Operations</h1>
          <p className="text-slate-500 text-sm font-medium">BantayBiyahe Real-time Command Center</p>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Total Fleet" value={stats.total} icon={<Bus size={20}/>} color="text-blue-600" />
        <SummaryCard label="Active Units" value={stats.active} icon={<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>} color="text-green-600" />
        <SummaryCard label="System Critical" value={stats.critical} icon={<AlertOctagon size={20}/>} color="text-red-600" />
      </div>

      {/* LIVE MAP CONTAINER */}
      <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden relative z-0">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-black text-slate-700 flex items-center text-[10px] uppercase tracking-widest">
            <MapPin size={16} className="mr-2 text-blue-600" /> 
            {isFollowing ? `Tracking Unit ${selectedVehicle?.id}` : 'Live Fleet Positioning'}
          </h2>
          
          {selectedVehicle && (
            <button 
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${
                isFollowing 
                ? 'bg-blue-600 text-white shadow-lg animate-pulse' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Activity size={14} />
              {isFollowing ? 'Following' : 'Follow Unit'}
            </button>
          )}
        </div>
        
        <div className="h-[400px] w-full z-0">
          <MapContainer center={[14.5813, 120.9930]} zoom={13} className="h-full w-full" key={mapKey}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {isFollowing && selectedVehicle && <MapFollower selectedVehicle={selectedVehicle} />}

            {filteredVehicles.map((vehicle) => (
              vehicle.lat && vehicle.lng && (
                <Marker 
                  key={vehicle.id} 
                  position={[vehicle.lat, vehicle.lng]} 
                  icon={getMarkerIcon(vehicle.activity, vehicle.status)}
                  eventHandlers={{ click: () => openModal(vehicle) }}
                >
                  <Popup>
                    <div className="text-center p-1">
                      <div className="font-black text-slate-800 uppercase italic leading-none">{vehicle.id}</div>
                      <div className="text-[8px] font-bold text-slate-400 mb-2 uppercase tracking-widest">{vehicle.plate}</div>
                      <div className="bg-slate-50 p-2 rounded-lg mb-3">
                         <span className="text-[9px] font-black text-blue-600 uppercase">
                            {vehicle.current_address || 'STATIONARY'}
                         </span>
                      </div>
                      <button 
                        onClick={() => setIsFollowing(true)} 
                        className="w-full bg-slate-900 text-white text-[9px] font-black uppercase py-2.5 rounded-lg hover:bg-blue-600 transition-all"
                      >
                        Live Follow
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

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col lg:flex-row gap-3 w-full bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={20} />
          <input 
            type="text" 
            placeholder="Search Fleet ID or Plate..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold transition-all"
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
                statusFilter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* MONITORING GRID */}
      <div className="mt-8 pb-10 min-h-[300px]">
        {filteredVehicles && filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVehicles.map((v) => (
              /* Pass individual ID to each card to use the hook */
              <VehicleCard key={v.id} vehicleId={v.id} initialData={v} onClick={() => openModal(v)} />
            ))}
          </div>
        ) : (
          <EmptyFleetState 
            filter={statusFilter} 
            searchTerm={searchTerm} 
            onReset={() => {setSearchTerm(''); setStatusFilter('all');}} 
          />
        )}
      </div>

      <VehicleDetailModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        vehicle={selectedVehicle} 
        mapKey={mapKey} 
      />
    </div>
  );
};

// --- UPDATED VEHICLE CARD COMPONENT ---

const VehicleCard = ({ vehicleId, initialData, onClick }) => {
  // Use the useVehicleData hook for each individual card
  const { vehicleData } = useVehicleData(vehicleId);

  // Determine if the vehicle is active
  const isVehicleActive = vehicleData.activity === 'Active';

  return (
    <div onClick={onClick} className="bg-white p-5 rounded-[28px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-inner ${
            isVehicleActive ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-slate-50 text-slate-400'
          }`}>
            <Bus size={22} />
          </div>
          <div className="text-left">
            <h3 className="font-black text-slate-800 uppercase tracking-tight leading-none mb-1 italic">{vehicleData.id || initialData.id}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{vehicleData.plate || initialData.plate}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border shadow-sm 
            ${vehicleData.activity === 'Active' ? 'bg-green-100 text-green-700 border-green-200' :
              vehicleData.activity === 'Under Maintenance' ? 'bg-amber-100 text-amber-700 border-amber-200' :
              'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {vehicleData.activity || 'Inactive'}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border shadow-sm
            ${vehicleData.status === 'Critical' ? 'bg-red-500 text-white border-red-600 animate-pulse' :
              vehicleData.status === 'Warning' ? 'bg-amber-500 text-white border-amber-600' :
              'bg-green-500 text-white border-green-600'}`}>
            {vehicleData.status || 'Normal'}
          </span>
        </div>
      </div>
      
      {/* Telemetry Grid - These values are filtered by useVehicleData */}
      <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 bg-slate-50/30 rounded-2xl mb-4">
        <TelemetryItem label="Speed" val={isVehicleActive ? (vehicleData.speed || 0) : "--"} unit="KMH" color={getStatusColor(vehicleData.speed, 'SPEED')} icon={<Gauge size={12}/>} />
        <TelemetryItem label="RPM" val={isVehicleActive ? (vehicleData.rpm || 0) : "--"} color={getStatusColor(vehicleData.rpm, 'RPM')} icon={<Gauge size={12}/>} />
        <TelemetryItem label="MIL" val={isVehicleActive ? (vehicleData.mil || 'OFF') : "--"} color={getStatusColor(vehicleData.mil, 'MIL')} icon={<CheckCircle size={12}/>} />
      </div>

      <div className="space-y-3">
        <AddressItem 
            label="Live Position" 
            address={isVehicleActive ? vehicleData.current_address : "Position Unavailable (Offline)"} 
            dotColor={isVehicleActive ? "bg-cyan-500" : "bg-slate-300"} 
        />
        <AddressItem 
            label="Approaching" 
            address={isVehicleActive ? vehicleData.next_address : "Route Data Paused"} 
            dotColor={isVehicleActive ? "bg-amber-500" : "bg-slate-300"} 
        />
      </div>
    </div>
  );
};

// --- HELPER SUB-COMPONENTS ---

const EmptyFleetState = ({ filter, searchTerm, onReset }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border-2 border-slate-100 border-dashed animate-in fade-in zoom-in duration-500 w-full col-span-full">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-200">
        <Bus size={28} />
      </div>
    </div>
    <h3 className="text-xl font-bold text-slate-800 tracking-tight uppercase italic">
      {filter !== 'all' ? `${filter} Units Empty` : 'Fleet Queue Empty'}
    </h3>
    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 max-w-[320px] text-center leading-relaxed">
      {searchTerm 
        ? `No matches for "${searchTerm}" found in current filters.` 
        : `There are no vehicles currently categorized as ${filter}.`}
    </p>
    {(searchTerm || filter !== 'all') && (
      <button 
        onClick={onReset}
        className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
      >
        Clear All Filters
      </button>
    )}
  </div>
);

const SummaryCard = ({ label, value, icon, color }) => (
  <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between">
    <div className="text-left">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">{icon}</div>
  </div>
);

const TelemetryItem = ({ label, val, unit, color, icon }) => (
  <div className="text-center">
    <div className="flex justify-center text-slate-300 mb-0.5">{icon}</div>
    <div className={`text-sm font-black font-mono leading-none ${color}`}>
        {val ?? 0}<span className="text-[10px] ml-0.5 uppercase">{unit}</span>
    </div>
    <div className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">{label}</div>
  </div>
);

const AddressItem = ({ label, address, dotColor }) => (
  <div className="flex items-start gap-2.5 text-left">
    <div className={`mt-1.5 h-1.5 w-1.5 rounded-full ${dotColor} shadow-sm shrink-0`} />
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1 tracking-tight">{label}</p>
      <p className="text-[11px] font-semibold text-slate-600 truncate uppercase tracking-tight">{address || 'STATIONARY'}</p>
    </div>
  </div>
);

export default DispatcherVehicles;