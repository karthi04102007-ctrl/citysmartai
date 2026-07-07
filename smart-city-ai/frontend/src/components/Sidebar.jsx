import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  Map, 
  Info,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Analyze Upload', icon: UploadCloud },
    { id: 'reports', label: 'Surveillance Logs', icon: FileText },
    { id: 'map', label: 'Incident Map', icon: Map },
    { id: 'about', label: 'About Project', icon: Info },
  ];

  return (
    <aside className="w-64 border-r border-dark-800/80 bg-dark-950 flex flex-col h-[calc(100vh-4rem)] p-4 justify-between">
      <div className="space-y-1">
        <div className="px-3 mb-4 text-xs font-semibold uppercase tracking-wider text-dark-500">
          Navigation
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15'
                    : 'text-dark-400 hover:bg-dark-900/60 hover:text-dark-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 transition-transform duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform duration-200 opacity-0 ${
                  isActive ? 'opacity-100' : 'group-hover:opacity-60 group-hover:translate-x-0.5'
                }`} />
              </button>
            );
          })}
        </nav>
      </div>

      <div className="glass-card rounded-xl p-3 border border-dark-800/30 bg-dark-900/10">
        <div className="text-[10px] text-dark-500 uppercase tracking-wider font-semibold">Surveillance System</div>
        <div className="text-xs text-dark-300 mt-1 font-medium">Hackathon Prototype v1.0</div>
        <div className="text-[10px] text-dark-400 mt-2">Prepared for presentation</div>
      </div>
    </aside>
  );
};

export default Sidebar;
