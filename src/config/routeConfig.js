// src/config/routeConfig.js
import { supabase } from '../supabaseClient';
import pandacanRouteData from '../data/pandacanRoute.json';

export const PANDACAN_ROUTE = pandacanRouteData;

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lat2 || !lon1 || !lon2) return 0;
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(3));
};

export const syncVehicleAddress = async (vehicleId) => {
  if (!vehicleId) return;

  // 1. Fetch current lat/lng from the columns you kept
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('lat, lng')
    .eq('id', vehicleId)
    .single();

  if (!vehicle || !vehicle.lat) return;

  // 2. Map distances to all points in the route
  const pointsWithDistance = PANDACAN_ROUTE.map((stop, index) => ({
    ...stop,
    index,
    dist: calculateDistance(vehicle.lat, vehicle.lng, stop.lat, stop.lng)
  }));

  // 3. Find the closest point
  const sorted = pointsWithDistance.sort((a, b) => a.dist - b.dist);
  const closest = sorted[0];
  
  // DEBUG LOGIC:
  // current_address is the landmark you just reached or are closest to.
  // next_address is the one immediately AFTER it in the JSON array.
  let currentAddress = closest.name;
  let nextIndex = closest.index + 1;

  // If we are at the very last stop in the JSON, next is "END OF ROUTE"
  let nextAddress = nextIndex < PANDACAN_ROUTE.length 
    ? PANDACAN_ROUTE[nextIndex].name 
    : "END OF ROUTE";

  // 4. Update the Supabase columns (current_address and next_address)
  await supabase
    .from('vehicles')
    .update({ 
      current_address: currentAddress,
      next_address: nextAddress 
    })
    .eq('id', vehicleId);
    
  return { currentAddress, nextAddress };
};