import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ points, options }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points) return;

    // Convert points to array of arrays [lat, lng, intensity]
    const heatPoints = points.map(p => [
      p.location?.latitude, 
      p.location?.longitude, 
      1 // default intensity
    ]).filter(p => p[0] !== undefined && p[1] !== undefined);

    const heatLayer = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' },
      ...options
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null;
};

export default HeatmapLayer;
