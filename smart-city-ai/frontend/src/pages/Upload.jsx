import React, { useState } from 'react';
import { Eye, ShieldAlert, Sparkles, Monitor } from 'lucide-react';
import UploadCard from '../components/UploadCard';
import DetectionCard from '../components/DetectionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { uploadImage } from '../services/api';

const Upload = ({ onDetectionSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (file, latitude, longitude) => {
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await uploadImage(file, latitude, longitude);
      setResult(data);
      // Notify parent to refresh dashboard counts and map
      if (onDetectionSuccess) {
        onDetectionSuccess();
      }
    } catch (err) {
      console.error(err);
      setError('AI model inference connection timed out or database error. Please verify the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white">Surveillance Analysis Workspace</h2>
        <p className="text-xs text-dark-400">Dispatch virtual CCTV snapshots to the city's YOLO-surveillance model</p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left Side: File Upload and Coordinates Form */}
        <div className="col-span-2 space-y-4">
          <UploadCard onAnalyze={handleAnalyze} isLoading={isLoading} />
          
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
              <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />
              <div>
                <span className="font-bold">Execution Error:</span> {error}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Detection Results View */}
        <div className="col-span-3">
          {isLoading ? (
            <div className="glass-panel rounded-2xl border border-dark-800/60 bg-dark-900/10 h-full flex items-center justify-center p-6">
              <LoadingSpinner message="Scanning pixels & bounding contours with YOLO..." />
            </div>
          ) : result ? (
            <DetectionCard result={result} onDismiss={handleDismiss} />
          ) : (
            <div className="glass-panel rounded-2xl border border-dark-800/60 bg-dark-900/10 h-full flex flex-col items-center justify-center text-center p-8 min-h-[450px]">
              <div className="h-12 w-12 rounded-2xl bg-dark-900 flex items-center justify-center border border-dark-800 mb-4">
                <Monitor className="h-6 w-6 text-dark-500 animate-pulse" />
              </div>
              <h4 className="text-sm font-semibold text-white">Surveillance Feed Monitor</h4>
              <p className="text-xs text-dark-400 mt-1.5 max-w-sm leading-relaxed">
                Select a sample image from the quick-demo buttons or upload your own CCTV snap. Specify coordinates and click "Analyze" to inspect anomalies.
              </p>
              
              <div className="flex items-center gap-1.5 rounded-full bg-blue-500/5 border border-blue-500/20 px-3.5 py-1 text-[10px] font-semibold text-blue-400 mt-6">
                <Sparkles className="h-3 w-3" />
                <span>YOLOv8 & EXIF parser active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
