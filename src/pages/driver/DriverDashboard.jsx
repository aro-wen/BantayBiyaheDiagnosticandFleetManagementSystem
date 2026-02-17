import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  AlertTriangle, Play, Square, AlertOctagon, CheckCircle, 
  Zap, Droplets, Gauge // Icons
} from 'lucide-react';

const DriverDashboard = () => {
  // --- 1. STATE ---
  const [vehicleData, setVehicleData] = useState({ 
    speed: 0, 
    rpm: 0, 
    coolant_temp: 85, 
    battery_voltage: 12.8, 
    fuel_level: 65,
    mil_status: false, 
    status: 'Normal' 
  });
  
  const [isTripActive, setIsTripActive] = useState(false);
  const [tripDistance, setTripDistance] = useState(0.0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const VEHICLE_ID = "V-101"; // Hardcoded for this Pi

  // --- 2. LOGIC & EFFECTS ---
  useEffect(() => {
    // Clock Timer
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    // Initial Fetch
    fetchLatest();

    // Supabase Live Subscription
    const subscription = supabase
      .channel('driver-dashboard')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'vehicles', filter: `id=eq.${VEHICLE_ID}` }, 
        (payload) => setVehicleData(prev => ({...prev, ...payload.new}))
      )
      .subscribe();

    return () => { 
      clearInterval(clockInterval); 
      supabase.removeChannel(subscription); 
    };
  }, []);

  // Simulate Trip Distance increasing if moving
  useEffect(() => {
    let tripInterval;
    if (isTripActive && vehicleData.speed > 0) {
      tripInterval = setInterval(() => {
        // Rough estimation: speed (km/h) / 3600 = km/sec
        setTripDistance(prev => prev + (vehicleData.speed / 3600));
      }, 1000);
    }
    return () => clearInterval(tripInterval);
  }, [isTripActive, vehicleData.speed]);

  const fetchLatest = async () => {
    const { data } = await supabase.from('vehicles').select('*').eq('id', VEHICLE_ID).single();
    if (data) setVehicleData(data);
  };

  const toggleTrip = async () => {
    setIsTripActive(!isTripActive);
    // Optional: Log trip start/end to DB
  };

  const reportEmergency = async () => {
    if(!window.confirm("CONFIRM SOS ALERT?")) return;
    await supabase.from('alerts').insert({
      vehicle: VEHICLE_ID,
      message: "SOS EMERGENCY TRIGGERED",
      type: "Critical",
      status: "Unread"
    });
  };

  // --- 3. VISUAL COMPONENTS ---

  // Helper to render the Segmented Speed Bar
  const renderSpeedBars = (speed) => {
    const totalBars = 20;
    const activeBars = Math.min(Math.floor((speed / 140) * totalBars), totalBars);
    
    return (
      <div className="flex gap-1 h-8 mt-4 w-full px-4">
        {[...Array(totalBars)].map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 rounded-sm skew-x-[-12deg] transition-all duration-100 ${
              i < activeBars 
                ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' 
                : 'bg-slate-800'
            }`}
          />
        ))}
      </div>
    );
  };

  // Helper for Circular RPM Gauge
  const RPMGauge = ({ rpm }) => {
    const maxRPM = 8000;
    const percentage = Math.min(rpm / maxRPM, 1);
    // Arc logic: 180 degrees total. 
    const rotation = -90 + (percentage * 180); 

    return (
      <div className="relative w-48 h-24 overflow-hidden flex justify-center items-end mb-2">
         {/* Background Arc */}
         <div className="absolute w-44 h-44 rounded-full border-[12px] border-slate-800 border-b-0 top-0 box-border"></div>
         
         {/* Active Arc (SVG for smooth filling) */}
         <svg className="absolute w-44 h-44 top-0" viewBox="0 0 100 100">
             <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="#22d3ee" 
                strokeWidth="12" 
                strokeDasharray="126" 
                strokeDashoffset={126 - (126 * percentage)} 
                strokeLinecap="round"
                className="drop-shadow-[0_0_5px_rgba(34,211,238,0.5)] transition-all duration-300 ease-out"
             />
         </svg>

         {/* Needle (CSS Rotation) */}
         <div 
            className="absolute bottom-0 w-1 h-24 bg-white origin-bottom transition-transform duration-300 ease-out z-10"
            style={{ transform: `rotate(${rotation}deg)` }}
         ></div>
         
         {/* Center Hub */}
         <div className="absolute bottom-[-10px] w-4 h-4 bg-slate-200 rounded-full z-20"></div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col p-4 select-none">
      
      {/* --- HUD FRAME --- */}
      <div className="flex-1 bg-slate-900/50 rounded-3xl border border-slate-700/50 shadow-2xl p-2 grid grid-rows-[3fr_1.5fr_1.5fr_1fr] gap-2">
        
        {/* ROW 1: SPEED & RPM (Top Half) */}
        <div className="grid grid-cols-2 gap-2">
            
            {/* 1A: SPEEDOMETER */}
            <div className="bg-black/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative">
                <div className="text-[120px] leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                    {Math.round(vehicleData.speed)}
                </div>
                <div className="text-cyan-400 font-bold tracking-widest text-lg uppercase mb-2">KM/H</div>
                {renderSpeedBars(vehicleData.speed)}
            </div>

            {/* 1B: RPM GAUGE */}
            <div className="bg-black/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center pt-8">
                <RPMGauge rpm={vehicleData.rpm} />
                <div className="text-4xl font-bold text-cyan-400 mt-2">{vehicleData.rpm}</div>
                <div className="text-slate-500 text-xs font-bold tracking-widest uppercase">RPM</div>
            </div>
        </div>

        {/* ROW 2: INFO PANELS (Coolant, Batt, Fuel) */}
        <div className="grid grid-cols-3 gap-2">
            {/* COOLANT */}
            <div className="bg-black/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-2">
                <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Coolant</div>
                <div className={`text-3xl font-bold ${vehicleData.coolant_temp > 105 ? 'text-orange-500 animate-pulse' : 'text-orange-400'}`}>
                    {vehicleData.coolant_temp}
                </div>
                <div className="text-slate-600 text-xs">°C</div>
            </div>

            {/* BATTERY */}
            <div className="bg-black/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-2">
                <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Battery</div>
                <div className={`text-3xl font-bold ${vehicleData.battery_voltage < 12 ? 'text-red-500' : 'text-blue-400'}`}>
                    {vehicleData.battery_voltage}
                </div>
                <div className="text-slate-600 text-xs">V</div>
            </div>

            {/* FUEL */}
            <div className="bg-black/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-2">
                <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Fuel</div>
                <div className={`text-3xl font-bold ${vehicleData.fuel_level < 20 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {vehicleData.fuel_level}
                </div>
                <div className="text-slate-600 text-xs">%</div>
            </div>
        </div>

        {/* ROW 3: TRIP & MIL */}
        <div className="grid grid-cols-2 gap-2">
            {/* TRIP DISTANCE */}
            <div className="bg-black/40 rounded-xl border border-slate-800 p-4 flex flex-col justify-center">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Trip Distance</div>
                <div className="text-4xl font-mono font-bold text-cyan-400 mt-1">
                    {tripDistance.toFixed(2)}
                </div>
                <div className="text-slate-600 text-xs uppercase font-bold mt-1">Kilometers</div>
            </div>

            {/* MIL STATUS */}
            <div className="bg-black/40 rounded-xl border border-slate-800 p-4 flex flex-col items-center justify-center">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">System Diagnostic</div>
                {vehicleData.mil_status ? (
                     <div className="flex flex-col items-center animate-pulse">
                        <AlertOctagon size={32} className="text-amber-500 mb-1" />
                        <div className="text-amber-500 font-bold tracking-wider">CHECK ENGINE</div>
                     </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <CheckCircle size={32} className="text-green-500 mb-1" />
                        <div className="text-green-500 font-bold tracking-wider">SYSTEM OK</div>
                    </div>
                )}
            </div>
        </div>

        {/* ROW 4: BUTTONS */}
        <div className="grid grid-cols-2 gap-2">
            {/* START/STOP TRIP */}
            <button 
                onClick={toggleTrip}
                className={`rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest transition-all active:scale-95 ${
                    isTripActive 
                    ? 'bg-slate-800 text-slate-400 border border-slate-700' 
                    : 'bg-green-900/20 text-green-400 border border-green-500/50 hover:bg-green-900/40'
                }`}
            >
                {isTripActive ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                {isTripActive ? 'End Trip' : 'Start Trip'}
            </button>

            {/* SOS */}
            <button 
                onClick={reportEmergency}
                className="bg-red-900/20 border border-red-500/50 text-red-500 rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest hover:bg-red-900/40 transition-all active:scale-95"
            >
                <AlertTriangle size={18} />
                SOS Emergency
            </button>
        </div>

      </div>

      {/* FOOTER BAR */}
      <div className="flex justify-between items-center px-4 mt-2 text-[10px] font-mono text-slate-600 uppercase">
        <div>HUD V1.2.0 • BANTAY BIYAHE</div>
        <div>{currentTime.toLocaleTimeString()}</div>
      </div>

    </div>
  );
};

export default DriverDashboard;