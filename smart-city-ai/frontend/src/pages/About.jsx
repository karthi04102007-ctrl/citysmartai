import React from 'react';
import { Shield, Server, Cpu, Database, Mail, Terminal } from 'lucide-react';

const About = () => {
  const techStack = [
    { title: 'Frontend Stack', desc: 'React, Vite, Tailwind CSS, Leaflet Map, Axios, Recharts', icon: Server, color: 'text-blue-400' },
    { title: 'Backend Engine', desc: 'FastAPI (Python), Uvicorn Server, Pillow, Pydantic, HTTPX', icon: Cpu, color: 'text-purple-400' },
    { title: 'Database Layer', desc: 'Motor async driver, MongoDB Atlas cloud storage (fallback to local mock)', icon: Database, color: 'text-emerald-400' },
    { title: 'AI Detection', desc: 'Ultralytics YOLOv8, OpenCV, pillow annotations (fallback to rule mock)', icon: Shield, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-white">Project Information</h2>
        <p className="text-xs text-dark-400">CivicEye AI: CCTV Surveillance & Automated Municipal Routing System</p>
      </div>

      {/* Intro card */}
      <div className="glass-panel rounded-2xl p-6 border border-dark-800/60 bg-dark-900/20 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Concept Summary</h3>
        <p className="text-xs text-dark-300 leading-relaxed">
          CivicEye AI simulates a modern urban CCTV surveillance network. The system processes video frames or images, detects public infrastructure faults (potholes, broken street lights, drainage overflow, fallen trees), resolves coordinates into addresses, stores them in MongoDB, and routes notifications automatically to the municipal wing responsible for repairs.
        </p>
      </div>

      {/* Tech Grid */}
      <div className="grid grid-cols-2 gap-4">
        {techStack.map((tech, idx) => {
          const Icon = tech.icon;
          return (
            <div 
              key={idx}
              className="glass-card rounded-xl p-4 border border-dark-850 bg-dark-900/10 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4.5 w-4.5 ${tech.color}`} />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{tech.title}</h4>
              </div>
              <p className="text-xs text-dark-450 leading-relaxed font-semibold">{tech.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Robust Fallbacks Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-dark-800/60 bg-dark-900/20 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Terminal className="h-4.5 w-4.5 text-yellow-500" />
          Prototype Resiliency & Fallbacks
        </h3>
        
        <div className="space-y-3.5 text-xs text-dark-300 leading-relaxed">
          <div className="flex gap-2.5">
            <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0 mt-1.5"></span>
            <div>
              <span className="font-bold text-white">Database Fallback (Offline-Ready):</span> If the cloud MongoDB Atlas connection is absent or times out (3s), the API transparently switches to an in-memory database. All features remain 100% operational.
            </div>
          </div>

          <div className="flex gap-2.5">
            <span className="h-2 w-2 rounded-full bg-purple-400 shrink-0 mt-1.5"></span>
            <div>
              <span className="font-bold text-white">AI Detection Fallback:</span> If heavy AI libraries cannot compile on the target computer, the app uses a filename-driven keyword router that mocks YOLOv8 bounding boxes and draws highlight boxes on images programmatically using Pillow.
            </div>
          </div>

          <div className="flex gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
            <div>
              <span className="font-bold text-white">Email Notification Fallback:</span> If SMTP credentials are left blank in `.env`, the server operates in simulation mode. It logs the exact email header and letter body to the console and sends it back to the client for rendering in the live email preview box.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
