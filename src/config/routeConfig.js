import { supabase } from '../supabaseClient';
import pandacanRouteData from '../data/pandacanRoute.json';

// Split correctly: 0-33 (Forward), 33-end (Return)
export const ROUTE_FORWARD = pandacanRouteData.slice(0, 33); 
export const ROUTE_RETURN = pandacanRouteData.slice(33);

/**
 * Standard Haversine formula for distance calculation
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lat2 || !lon1 || !lon2) return 0;
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(3));
};

/**
 * Synchronizes the human-readable address based STRICTLY on database direction
 */
export const syncVehicleAddress = async (vehicleId) => {
  if (!vehicleId) return;

  // 1. Fetch latest state from Supabase
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('lat, lng, trip_direction')
    .eq('id', vehicleId)
    .single();

  if (error || !vehicle || !vehicle.lat) return;

  // 2. Lock the search to the current database direction
  const activeRoute = vehicle.trip_direction === 'Return' ? ROUTE_RETURN : ROUTE_FORWARD;

  // 3. Find closest waypoint only within the active bound
  const pointsWithDistance = activeRoute.map((stop, index) => ({
    ...stop,
    index,
    dist: calculateDistance(vehicle.lat, vehicle.lng, stop.lat, stop.lng)
  }));

  const closest = pointsWithDistance.sort((a, b) => a.dist - b.dist)[0];
  
  let currentAddress = closest.name;
  let nextIndex = closest.index + 1;

  // 4. Determine next stop name
  let nextAddress = nextIndex < activeRoute.length 
    ? activeRoute[nextIndex].name 
    : (vehicle.trip_direction === 'Return' ? "Pandacan Cooperative" : "Leon Guinto Terminal");

  // 5. Update Supabase (Trigger handles trip_direction)
  await supabase
    .from('vehicles')
    .update({ 
      current_address: currentAddress,
      next_address: nextAddress 
    })
    .eq('id', vehicleId);
    
  return { currentAddress, nextAddress, direction: vehicle.trip_direction };
};