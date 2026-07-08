import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getImageUrl } from '../services/api';
import StatusBadge from './StatusBadge';
import HeatmapLayer from './HeatmapLayer';

// Custom colored SVG pin markers to bypass default image path resolution issues in React/Vite
const createCustomIcon = (status) => {
  const colors = {
    'Pending': '#EF4444',     // Red
    'Detected': '#EF4444',    // Red
    'Assigned': '#F59E0B',    // Amber
    'Resolved': '#10B981',    // Emerald
  };
  const color = colors[status] || '#3B82F6'; // Default Blue
  
  const svgTemplate = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="28" height="28">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgTemplate,
    className: 'custom-marker-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

// Sub-component to pan the map dynamically when center coordinates change
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const MapView = ({ reports, center = [9.9252, 78.1198], onMarkerClick, viewMode = 'pins' }) => {
  return (
    <div className="w-full h-full relative overflow-hidden rounded-2xl border border-dark-800/60 shadow-lg bg-dark-950">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* CartoDB Dark Matter map tile server */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        
        <RecenterMap center={center} />
        
        {viewMode === 'heatmap' ? (
          <HeatmapLayer points={reports} />
        ) : (
          reports.map((report) => {
            const lat = report.location?.latitude;
            const lon = report.location?.longitude;
            if (lat === undefined || lon === undefined || lat === null || lon === null) return null;
            
            return (
              <Marker 
                key={report.id} 
                position={[lat, lon]}
                icon={createCustomIcon(report.status)}
                eventHandlers={{
                  click: () => {
                    if (onMarkerClick) onMarkerClick(report);
                  }
                }}
              >
                <Popup>
                  <div className="w-48 text-left space-y-2 p-1">
                    <div className="flex items-center justify-between border-b border-dark-850 pb-1.5">
                    <span className="font-bold text-white text-xs leading-none">{report.issueType}</span>
                    <div className="flex gap-1 items-center">
                      <span 
                        className={`h-2 w-2 rounded-full ${report.severity === 'High' ? 'bg-red-500' : report.severity === 'Low' ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                        title={`Severity: ${report.severity || 'Medium'}`}
                      ></span>
                      <StatusBadge status={report.status} />
                    </div>
                  </div>
                    
                    {report.image && (
                      <div className="rounded overflow-hidden border border-dark-800 aspect-video bg-dark-950">
                        <img 
                          src={getImageUrl(report.image)} 
                          alt={report.issueType} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="text-[10px] text-dark-300">
                    <p className="font-semibold text-dark-200 line-clamp-2 leading-snug">{report.location.address}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[9px] text-dark-500 font-mono">
                        Reported: {new Date(report.reportedAt).toLocaleDateString()}
                      </p>
                      {report.costEstimate > 0 && (
                        <span className="text-[9px] font-mono text-amber-400/80 bg-amber-500/10 px-1 rounded border border-amber-500/20">
                          Est: ${report.costEstimate}
                        </span>
                      )}
                    </div>
                  </div>
                  </div>
                </Popup>
              </Marker>
            );
          })
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
