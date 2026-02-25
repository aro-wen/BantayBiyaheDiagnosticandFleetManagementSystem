import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  AlertTriangle, Play, Square, AlertOctagon, CheckCircle,
  CarFront, HeartPulse, Wrench, ShieldAlert, X, Check, ArrowLeft // Added ArrowLeft
} from 'lucide-react';
import { VEHICLE_THRESHOLDS, getStatusColor, isMilActive } from '../../config/thresholds'; 

const DriverDashboard = () => {
  // --- STATE ---
  const [vehicleData, setVehicleData] = useState({ 
    speed: 0, rpm: 0, temp: 85, battery: 12.8, fuel: 65, mil: 'OFF', status: 'Normal' 
  });
  
  const [isTripActive, setIsTripActive] = useState(false);
  const [tripDistance, setTripDistance] = useState(0.0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 🔥 UPDATED SOS STATE MACHINE
  const [showSosOverlay, setShowSosOverlay] = useState(false);
  const [sosStep, setSosStep] = useState('MENU'); // 'MENU', 'CONFIRM', 'SENDING', 'SUCCESS'
  const [selectedSosType, setSelectedSosType] = useState(null);

  const VEHICLE_ID = "V-101"; 

  // --- LOGIC ---
  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchLatest();

    const channel = supabase.channel('driver-dashboard-telemetry')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'vehicles' }, (payload) => {
          if (payload.new.id === VEHICLE_ID) setVehicleData(prev => ({...prev, ...payload.new}));
      })
      .on('broadcast', { event: `telemetry_${VEHICLE_ID}` }, (payload) => {
         setVehicleData(prev => ({
            ...prev, ...payload.payload,
            temp: payload.payload.temp || payload.payload.coolant_temp || prev.temp,
            battery: payload.payload.battery || payload.payload.battery_voltage || prev.battery,
            fuel: payload.payload.fuel || payload.payload.fuel_level || prev.fuel,
            mil: payload.payload.mil || payload.payload.mil_status || prev.mil
         }));
      })
      .subscribe();

    return () => { clearInterval(clockInterval); supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    let tripInterval;
    if (isTripActive && vehicleData.speed > 0) {
      tripInterval = setInterval(() => setTripDistance(prev => prev + (vehicleData.speed / 3600)), 1000);
    }
    return () => clearInterval(tripInterval);
  }, [isTripActive, vehicleData.speed]);

  const fetchLatest = async () => {
    const { data } = await supabase.from('vehicles').select('*').eq('id', VEHICLE_ID).single();
    if (data) setVehicleData(data);
  };

  const toggleTrip = () => setIsTripActive(!isTripActive);

  // --- 🔥 NEW 2-STEP SOS LOGIC ---
  
  const openSosMenu = () => {
    setShowSosOverlay(true);
    setSosStep('MENU'); // Reset to grid
    setSelectedSosType(null);
  };

  const handleSelectReason = (reason, type = 'Critical') => {
    setSelectedSosType({ reason, type });
    setSosStep('CONFIRM'); // Move to confirmation screen
  };

  const confirmSendSos = async () => {
    if (!selectedSosType) return;
    
    setSosStep('SENDING');
    
    // Create the alert in Supabase
    const { error } = await supabase.from('alerts').insert({
      vehicle: VEHICLE_ID,
      message: `SOS: ${selectedSosType.reason.toUpperCase()}`, 
      type: selectedSosType.type,
      status: "Unread"
    });

    if (!error) {
      setSosStep('SUCCESS');
      // Wait 2 seconds, then close everything
      setTimeout(() => {
        setShowSosOverlay(false);
        setSosStep('MENU');
      }, 2000);
    } else {
      setSosStep('MENU'); // Reset on fail
      alert("Failed to send SOS. Check connection.");
    }
  };


  // --- HELPERS (Visuals) ---
  const renderSpeedBars = (speed) => {
    const totalBars = 20;
    const activeBars = Math.min(Math.floor((speed / VEHICLE_THRESHOLDS.SPEED.MAX) * totalBars), totalBars);
    return (
      <div className="flex gap-1 h-8 mt-4 w-full px-4">
        {[...Array(totalBars)].map((_, i) => (
          <div key={i} className={`flex-1 rounded-sm skew-x-[-12deg] transition-all duration-100 ${i < activeBars ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-800'}`} />
        ))}
      </div>
    );
  };

  const RPMGauge = ({ rpm }) => {
    const maxRPM = VEHICLE_THRESHOLDS.RPM.MAX + 1000;
    const percentage = Math.min(rpm / maxRPM, 1);
    const rotation = -90 + (percentage * 180); 
    const isRedlining = rpm >= VEHICLE_THRESHOLDS.RPM.MAX;
    return (
      <div className="relative w-48 h-24 overflow-hidden flex justify-center items-end mb-2">
         <div className="absolute w-44 h-44 rounded-full border-[12px] border-slate-800 border-b-0 top-0 box-border"></div>
         <svg className="absolute w-44 h-44 top-0" viewBox="0 0 100 100">
             <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={isRedlining ? "#ef4444" : "#22d3ee"} strokeWidth="12" strokeDasharray="126" strokeDashoffset={126 - (126 * percentage)} strokeLinecap="round" className="transition-all duration-300 ease-out"/>
         </svg>
         <div className={`absolute bottom-0 w-1 h-24 origin-bottom transition-transform duration-300 ease-out z-10 ${isRedlining ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-white'}`} style={{ transform: `rotate(${rotation}deg)` }}></div>
         <div className="absolute bottom-[-10px] w-4 h-4 bg-slate-200 rounded-full z-20"></div>
      </div>
    );
  };

  const milActive = isMilActive(vehicleData.mil);

  return (
    <div className="h-screen w-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col p-4 select-none relative">
      
      {/* --- DASHBOARD CONTENT --- */}
      <div className="flex-1 bg-slate-900/50 rounded-3xl border border-slate-700/50 shadow-2xl p-2 grid grid-rows-[3fr_1.5fr_1.5fr_1fr] gap-2">
        
        {/* ROW 1: SPEED & RPM */}
        <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative">
                <div className="text-[120px] leading-none font-black text-white tracking-tighter drop-shadow-2xl">{Math.round(vehicleData.speed || 0)}</div>
                <div className={`font-bold tracking-widest text-lg uppercase mb-2 ${vehicleData.speed > VEHICLE_THRESHOLDS.SPEED.WARNING ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>KM/H</div>
                {renderSpeedBars(vehicleData.speed || 0)}
            </div>
            <div className="bg-black/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center pt-8">
                <RPMGauge rpm={vehicleData.rpm || 0} />
                <div className={`text-4xl font-bold mt-2 ${vehicleData.rpm >= VEHICLE_THRESHOLDS.RPM.WARNING ? 'text-red-500' : 'text-cyan-400'}`}>{vehicleData.rpm || 0}</div>
                <div className="text-slate-500 text-xs font-bold tracking-widest uppercase">RPM</div>
            </div>
        </div>

        {/* ROW 2: INFO PANELS */}
        <div className="grid grid-cols-3 gap-2">
            <div className="bg-black/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-2">
                <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Coolant</div>
                <div className={`text-3xl ${getStatusColor(vehicleData.temp, 'TEMP')}`}>{vehicleData.temp || 0}</div>
                <div className="text-slate-600 text-xs">°C</div>
            </div>
            <div className="bg-black/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-2">
                <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Battery</div>
                <div className={`text-3xl font-bold ${getStatusColor(vehicleData.battery, 'BATTERY')}`}>{vehicleData.battery || 0}</div>
                <div className="text-slate-600 text-xs">V</div>
            </div>
            <div className="bg-black/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-2">
                <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Fuel</div>
                <div className={`text-3xl font-bold ${getStatusColor(vehicleData.fuel, 'FUEL')}`}>{vehicleData.fuel || 0}</div>
                <div className="text-slate-600 text-xs">%</div>
            </div>
        </div>

        {/* ROW 3: TRIP & MIL */}
        <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/40 rounded-xl border border-slate-800 p-4 flex flex-col justify-center">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Trip Distance</div>
                <div className="text-4xl font-mono font-bold text-cyan-400 mt-1">{tripDistance.toFixed(2)}</div>
                <div className="text-slate-600 text-xs uppercase font-bold mt-1">Kilometers</div>
            </div>
            <div className="bg-black/40 rounded-xl border border-slate-800 p-4 flex flex-col items-center justify-center">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">System Diagnostic</div>
                {milActive ? (
                     <div className="flex flex-col items-center animate-pulse">
                        <AlertOctagon size={32} className="text-amber-500 mb-1" />
                        <div className={getStatusColor(vehicleData.mil, 'MIL')}>CHECK ENGINE</div>
                     </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <CheckCircle size={32} className="text-green-500 mb-1" />
                        <div className={getStatusColor(vehicleData.mil, 'MIL')}>SYSTEM OK</div>
                    </div>
                )}
            </div>
        </div>

        {/* ROW 4: BUTTONS */}
        <div className="grid grid-cols-2 gap-2">
            <button onClick={toggleTrip} className={`rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest transition-all active:scale-95 ${isTripActive ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-green-900/20 text-green-400 border border-green-500/50 hover:bg-green-900/40'}`}>
                {isTripActive ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                {isTripActive ? 'End Trip' : 'Start Trip'}
            </button>
            <button 
                onClick={openSosMenu}
                className="bg-red-600 text-white rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse"
            >
                <AlertTriangle size={24} />
                SOS Emergency
            </button>
        </div>
      </div>

      <div className="flex justify-between items-center px-4 mt-2 text-[10px] font-mono text-slate-600 uppercase">
        <div>HUD V1.2.0 • BANTAY BIYAHE</div>
        <div>{currentTime.toLocaleTimeString()}</div>
      </div>

      {/* --- 🔥 2-STEP SOS OVERLAY 🔥 --- */}
      {showSosOverlay && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm p-4 flex flex-col animate-in fade-in duration-200">
          
          {/* STEP 1: SELECT MENU */}
          {sosStep === 'MENU' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Select Emergency</h2>
                <button onClick={() => setShowSosOverlay(false)} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white">
                  <X size={32} />
                </button>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4 mb-4">
                <button onClick={() => handleSelectReason('Accident / Collision')} className="bg-red-600 hover:bg-red-700 rounded-3xl flex flex-col items-center justify-center gap-4 active:scale-95 transition-all shadow-lg shadow-red-900/50">
                  <CarFront size={64} className="text-white" />
                  <span className="text-2xl font-black text-white uppercase tracking-widest">Accident</span>
                </button>
                <button onClick={() => handleSelectReason('Medical Emergency')} className="bg-rose-500 hover:bg-rose-600 rounded-3xl flex flex-col items-center justify-center gap-4 active:scale-95 transition-all shadow-lg shadow-rose-900/50">
                  <HeartPulse size={64} className="text-white" />
                  <span className="text-2xl font-black text-white uppercase tracking-widest">Medical</span>
                </button>
                <button onClick={() => handleSelectReason('Mechanical Breakdown', 'Warning')} className="bg-orange-500 hover:bg-orange-600 rounded-3xl flex flex-col items-center justify-center gap-4 active:scale-95 transition-all shadow-lg shadow-orange-900/50">
                  <Wrench size={64} className="text-white" />
                  <span className="text-2xl font-black text-white uppercase tracking-widest">Breakdown</span>
                </button>
                <button onClick={() => handleSelectReason('Security Threat')} className="bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 rounded-3xl flex flex-col items-center justify-center gap-4 active:scale-95 transition-all shadow-lg">
                  <ShieldAlert size={64} className="text-white" />
                  <span className="text-2xl font-black text-white uppercase tracking-widest">Threat</span>
                </button>
              </div>
              <button onClick={() => setShowSosOverlay(false)} className="w-full py-6 bg-slate-900 border border-slate-700 rounded-2xl text-xl font-bold text-slate-400 uppercase tracking-widest active:scale-95 transition-all">Cancel Request</button>
            </>
          )}

          {/* STEP 2: CONFIRMATION (Safety Interlock) */}
          {sosStep === 'CONFIRM' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-300">
               <div className="bg-red-900/30 p-8 rounded-full mb-4">
                 <AlertTriangle size={80} className="text-red-500 animate-bounce" />
               </div>
               
               <div>
                 <p className="text-slate-400 text-lg uppercase font-bold tracking-widest mb-2">Confirm Alert Type</p>
                 <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight">
                    {selectedSosType?.reason}
                 </h2>
               </div>

               <div className="w-full grid grid-cols-1 gap-4 mt-8">
                  <button 
                    onClick={confirmSendSos}
                    className="w-full py-8 bg-red-600 hover:bg-red-700 rounded-3xl text-2xl font-black text-white uppercase tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-95 transition-all"
                  >
                    Hold to Send
                  </button>
                  
                  <button 
                    onClick={() => setSosStep('MENU')}
                    className="w-full py-6 bg-slate-800 hover:bg-slate-700 rounded-3xl text-xl font-bold text-slate-300 uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={24} /> Go Back
                  </button>
               </div>
            </div>
          )}

          {/* STEP 3: SENDING / SUCCESS FEEDBACK */}
          {(sosStep === 'SENDING' || sosStep === 'SUCCESS') && (
             <div className="absolute inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center animate-in fade-in">
                {sosStep === 'SENDING' ? (
                    <>
                        <AlertTriangle size={80} className="text-red-500 animate-bounce mb-4" />
                        <h2 className="text-4xl font-black text-white uppercase tracking-widest animate-pulse">Sending...</h2>
                    </>
                ) : (
                    <>
                        <CheckCircle size={100} className="text-green-500 mb-4 scale-125 animate-in zoom-in duration-300" />
                        <h2 className="text-4xl font-black text-green-500 uppercase tracking-widest">Alert Sent</h2>
                    </>
                )}
             </div>
          )}

        </div>
      )}

    </div>
  );
};

export default DriverDashboard;