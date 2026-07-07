import React, { useState } from 'react';
import { AlertCircle, Navigation, MapPin } from 'lucide-react';
import MapView from '../components/MapView';
import StatusBadge from '../components/StatusBadge';

const Map = ({ reports, isLoading }) => {
  const [mapCenter, setMapCenter] = useState([9.9252, 78.1198]);

  const handleIncidentFocus = (report) => {
    const lat = report.location?.latitude;
    const lon = report.location?.longitude;
    if (lat !== undefined && lon !== undefined && lat !== null && lon !== null) {
      setMapCenter([lat, lon]);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h2 className="text-xl font-extrabold text-white">Spatial Surveillance Map</h2>
        <p className="text-xs text-dark-400">Locate infrastructure anomalies and monitor dispatch alerts on a map</p>
      </div>

      <div className="grid grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Map Container */}
        <div className="col-span-3 h-full">
          {isLoading ? (
            <div className="glass-panel rounded-2xl h-full flex items-center justify-center border border-dark-800/60 bg-dark-900/10">
              <span className="text-xs text-dark-400 animate-pulse uppercase tracking-wider font-semibold">Loading Map Engine...</span>
            </div>
          ) : (
            <MapView 
              reports={reports} 
              center={mapCenter} 
              onMarkerClick={handleIncidentFocus}
            />
          )}
        </div>

        {/* Sidebar Focus List */}
        <div className="col-span-1 glass-panel rounded-2xl border border-dark-800/60 bg-dark-900/20 p-4 flex flex-col justify-between h-full min-h-0">
          <div className="flex flex-col h-full min-h-0">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5 shrink-0">
              <Navigation className="h-4 w-4 text-blue-500" />
              Incidents Directory
            </h3>

            {/* List */}
            <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0">
              {reports && reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => handleIncidentFocus(report)}
                  className="w-full text-left glass-card rounded-xl p-3 border border-dark-850 bg-dark-900/20 hover:border-blue-500/30 hover:bg-dark-900/40 transition-all duration-200 block space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white leading-none">{report.issueType}</span>
                    <StatusBadge status={report.status} />
                  </div>
                  
                  <div className="text-[10px] text-dark-400 flex items-start gap-1">
                    <MapPin className="h-3 w-3 text-dark-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{report.location.address}</span>
                  </div>
                </button>
              ))}

              {(!reports || reports.length === 0) && (
                <div className="text-center py-8 text-xs text-dark-500 flex flex-col items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-dark-600" />
                  <span>No active locations.</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-dark-800/80 pt-3 mt-3 text-[10px] text-dark-500 font-semibold shrink-0">
            Click an incident to focus the map lens.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
