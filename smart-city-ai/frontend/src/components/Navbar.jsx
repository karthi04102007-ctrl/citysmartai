import React from 'react';
import { Shield, Database, Wifi, Users, UserCog } from 'lucide-react';

const Navbar = ({ dbMode, role, setRole }) => {
  return (
    <header className="glass-panel sticky top-0 z-40 flex h-16 w-full items-center justify-between px-6 border-b border-dark-800/80 bg-dark-950/80">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/25">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold tracking-tight text-lg text-white">CIVICEYE <span className="text-blue-500 font-medium text-sm">AI</span></h1>
          <p className="text-xs text-dark-400">Smart City CCTV Surveillance</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Role Toggle */}
        <div className="flex bg-dark-900 rounded-lg p-1 border border-dark-800">
          <button 
            onClick={() => setRole('citizen')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-colors ${role === 'citizen' ? 'bg-blue-600 text-white' : 'text-dark-400 hover:text-white'}`}
          >
            <Users className="h-3.5 w-3.5" />
            Citizen
          </button>
          <button 
            onClick={() => setRole('admin')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-colors ${role === 'admin' ? 'bg-blue-600 text-white' : 'text-dark-400 hover:text-white'}`}
          >
            <UserCog className="h-3.5 w-3.5" />
            Admin
          </button>
        </div>

        {/* Dynamic DB Mode Indicator */}
        <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${
          dbMode === 'atlas' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }`}>
          <Database className="h-3.5 w-3.5" />
          <span>DB: {dbMode === 'atlas' ? 'MongoDB Atlas' : 'In-Memory (Mock)'}</span>
          <span className={`h-1.5 w-1.5 rounded-full ${dbMode === 'atlas' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`}></span>
        </div>
        
        <div className="flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-400">
          <Wifi className="h-3.5 w-3.5 animate-pulse" />
          <span>Surveillance Server: Live</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
