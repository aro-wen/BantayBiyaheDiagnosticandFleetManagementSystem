// src/config/thresholds.js

export const VEHICLE_THRESHOLDS = {
  // --- RPM ---
  RPM: {
    MAX: 7000,       
    WARNING: 6000,   
  },

  // --- SPEED (km/h) ---
  SPEED: {
    MAX: 140,        
    WARNING: 100,    
  },

  // --- TEMPERATURE (°C) ---
  TEMP: {
    CRITICAL: 105,   
    WARNING: 95,     
  },

  // --- BATTERY (Volts) ---
  BATTERY: {
    LOW: 11.5,       
    HIGH: 15.5,      
  },

  // --- FUEL (%) ---
  FUEL: {
    LOW: 20,         
    CRITICAL: 5,     
  },

  // --- MIL (Check Engine) ---
  // We list all values that should trigger the light
  MIL: {
    TRIGGER_VALUES: [true, 'ON', 'on', 'TRUE', 1, , 'Check Engine', 'Check Engine', 'CHECK ENGINE'] 
  }
};

/**
 * Helper to determine status color/class based on value
 */
export const getStatusColor = (value, type) => {
  const T = VEHICLE_THRESHOLDS;

  switch (type) {
    case 'RPM':
      if (value >= T.RPM.MAX) return 'text-red-500 animate-pulse font-bold';
      if (value >= T.RPM.WARNING) return 'text-orange-500 font-bold';
      return 'text-cyan-400';

    case 'SPEED':
      if (value >= T.SPEED.MAX) return 'text-red-500 animate-pulse font-bold';
      if (value >= T.SPEED.WARNING) return 'text-orange-500 font-bold';
      return 'text-cyan-400';

    case 'TEMP':
      if (value >= T.TEMP.CRITICAL) return 'text-red-500 animate-pulse font-bold';
      if (value >= T.TEMP.WARNING) return 'text-orange-500';
      return 'text-orange-400'; 

    case 'BATTERY':
      if (value <= T.BATTERY.LOW || value >= T.BATTERY.HIGH) return 'text-red-500 font-bold';
      return 'text-blue-400';

    case 'FUEL':
      if (value <= T.FUEL.CRITICAL) return 'text-red-500 animate-pulse font-bold';
      if (value <= T.FUEL.LOW) return 'text-orange-500';
      return 'text-green-400';

    case 'MIL':
      // Check if the value matches any of our "ON" triggers
      if (T.MIL.TRIGGER_VALUES.includes(value)) return 'text-amber-500 animate-pulse font-bold tracking-wider';
      return 'text-green-500 font-bold tracking-wider';

    default:
      return 'text-slate-200';
  }
};

/**
 * Helper to check if MIL is strictly ON (returns boolean)
 */
export const isMilActive = (value) => {
  return VEHICLE_THRESHOLDS.MIL.TRIGGER_VALUES.includes(value);
};