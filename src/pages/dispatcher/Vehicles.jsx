import React, { useState } from 'react';
import { Search, Filter, Truck, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import StatusBadge from '../../components/StatusBadge';
import { useJobs } from '../../contexts/JobContext'; // Keep Live Data
import VehicleDetailModal from '../../components/VehicleDetailModal'; // Back to Monitoring Modal

// --- LEAFLET ICON FIX ---
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: iconMarker, iconRetinaUrl: iconRetina, shadowUrl: iconShadow,
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DispatcherVehicles = () => {
  const { vehicles } = useJobs(); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // Monitoring State Only
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const filteredVehicles = vehicles.filter(v => 
    v.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (v.plate && v.plate.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fleet Operations</h1>
          <p className="text-slate-500">Monitor real-time status and telemetry</p>
        </div>
      </div>

      {/* --- 1. LIVE MAP SECTION --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-semibold text-slate-800 flex items-center">
            <MapPin size={20} className="mr-2 text-blue-600" />
            Live Fleet Map
          </h2>
          <div className="flex gap-3 text-xs font-medium">
            <span className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-1.5"></div> Normal</span>
            <span className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-1.5"></div> Warning</span>
            <span className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5"></div> Critical</span>
          </div>
        </div>
        
        <div className="h-[350px] w-full relative z-0">
          <MapContainer center={[14.6091, 121.0223]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredVehicles.map((vehicle) => (
              (vehicle.lat && vehicle.lng) ? (
                <Marker key={vehicle.id} position={[vehicle.lat, vehicle.lng]}>
                  <Popup>
                    <div className="text-center p-1">
                      <div className="font-bold text-slate-800">{vehicle.id}</div>
                      <div className="text-xs text-slate-500 mb-2">{vehicle.plate}</div>
                      <button 
                        onClick={() => openModal(vehicle)}
                        className="text-blue-600 text-xs font-bold hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            ))}
          </MapContainer>
        </div>
      </div>

      {/* --- 2. CONTROLS & SEARCH --- */}
      <div className="flex gap-3 w-full">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Vehicle ID or Plate..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center shadow-sm">
            <Filter size={18} className="mr-2" /> Filter
        </button>
      </div>

      {/* --- 3. VEHICLE CARDS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVehicles.map((vehicle) => (
          <div 
            key={vehicle.id} 
            onClick={() => openModal(vehicle)} // CLICK OPENS DETAILS AGAIN
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{vehicle.id}</h3>
                  <div className="text-xs text-slate-500">{vehicle.plate}</div>
                </div>
              </div>
              <StatusBadge type={vehicle.status} />
            </div>
            
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Speed</span>
                <span className="font-medium text-slate-800">{vehicle.speed || 0} km/h</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Temp</span>
                <span className={`font-medium ${(vehicle.temp || 0) > 100 ? 'text-red-600' : 'text-slate-800'}`}>
                  {vehicle.temp || 0}°C
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Location</span>
                <span className="font-medium text-slate-800 truncate max-w-[120px]">
                    {vehicle.address ? vehicle.address.split(',')[0] : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* SHARED MONITORING MODAL */}
      <VehicleDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicle={selectedVehicle}
      />

    </div>
  );
};

export default DispatcherVehicles;