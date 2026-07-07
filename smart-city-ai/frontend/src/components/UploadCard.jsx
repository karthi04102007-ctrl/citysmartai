import React, { useState, useRef } from 'react';
import { Upload, MapPin, Image as ImageIcon, Sparkles } from 'lucide-react';

const UploadCard = ({ onAnalyze, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [latitude, setLatitude] = useState('9.9252');
  const [longitude, setLongitude] = useState('78.1198');
  const fileInputRef = useRef(null);

  // Pre-configured coordinates for Madurai locations to make demo realistic
  const sampleCCTVs = [
    { name: 'Pothole (Anna Nagar)', file: 'sample_pothole.jpg', lat: 9.9252, lon: 78.1198 },
    { name: 'Streetlight (KK Nagar)', file: 'sample_streetlight.jpg', lat: 9.9167, lon: 78.1402 },
    { name: 'Drainage (Sellur)', file: 'sample_drainage.jpg', lat: 9.9320, lon: 78.1250 },
    { name: 'Fallen Tree (Tirunagar)', file: 'sample_fallentree.jpg', lat: 9.9095, lon: 78.1025 },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const loadSample = async (sample) => {
    try {
      // Fetch the sample image file from static path and create a File object
      const imgUrl = `http://127.0.0.1:8000/uploads/${sample.file}`;
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const file = new File([blob], sample.file, { type: 'image/jpeg' });
      
      setSelectedFile(file);
      setPreviewUrl(imgUrl);
      setLatitude(sample.lat.toString());
      setLongitude(sample.lon.toString());
    } catch (err) {
      console.error('Failed to load sample image:', err);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    const latNum = latitude ? parseFloat(latitude) : null;
    const lonNum = longitude ? parseFloat(longitude) : null;
    
    onAnalyze(selectedFile, latNum, lonNum);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-dark-800/60 bg-dark-900/30">
      <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
        <Upload className="h-4.5 w-4.5 text-blue-500" />
        Analyze CCTV Capture
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drag and Drop Zone */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-dark-700/60 hover:border-blue-500/50 hover:bg-dark-900/40 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group bg-dark-950/20"
        >
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          {previewUrl ? (
            <div className="flex flex-col items-center gap-3">
              <img 
                src={previewUrl} 
                alt="Upload preview" 
                className="max-h-48 rounded-lg shadow-lg border border-dark-800 object-cover"
              />
              <span className="text-xs text-dark-400 font-medium truncate max-w-xs">{selectedFile.name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-dark-900 flex items-center justify-center border border-dark-800 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-colors">
                <Upload className="h-5 w-5 text-dark-400 group-hover:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Click or drag image here</p>
                <p className="text-xs text-dark-400 mt-1">PNG, JPG, JPEG up to 10MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Select CCTV Feeds */}
        <div className="bg-dark-950/40 border border-dark-800/40 rounded-xl p-4">
          <div className="text-xs font-semibold text-dark-400 flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3 w-3 text-yellow-500" />
            Hackathon Quick-Select CCTV Demos:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sampleCCTVs.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadSample(sample)}
                className="flex items-center gap-2 rounded-lg border border-dark-800/40 bg-dark-900/50 hover:bg-dark-800/50 hover:border-dark-700/60 p-2 text-left text-xs font-medium text-dark-200 transition-all duration-200"
              >
                <ImageIcon className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{sample.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* GPS Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-dark-400 block mb-1">Latitude</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 9.9252"
                className="w-full bg-dark-950/60 border border-dark-800 rounded-xl py-2 pl-3 pr-8 text-sm focus:outline-none focus:border-blue-500/50 text-white font-medium"
              />
              <MapPin className="absolute right-2.5 top-2.5 h-4 w-4 text-dark-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-dark-400 block mb-1">Longitude</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 78.1198"
                className="w-full bg-dark-950/60 border border-dark-800 rounded-xl py-2 pl-3 pr-8 text-sm focus:outline-none focus:border-blue-500/50 text-white font-medium"
              />
              <MapPin className="absolute right-2.5 top-2.5 h-4 w-4 text-dark-500" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!selectedFile || isLoading}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm transition-all duration-300 ${
            selectedFile && !isLoading
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 cursor-pointer'
              : 'bg-dark-800 text-dark-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-dark-500 border-t-white"></span>
              <span>Running AI Detection Model...</span>
            </div>
          ) : (
            <span>Analyze Image</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadCard;
