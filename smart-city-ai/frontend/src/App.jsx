import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Reports from './pages/Reports';
import Map from './pages/Map';
import About from './pages/About';
import { getReports, getDashboardStats } from './services/api';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbMode, setDbMode] = useState('mock');
  const [role, setRole] = useState('admin'); // 'admin' or 'citizen'

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const reportsData = await getReports();
      setReports(reportsData);
      
      const statsData = await getDashboardStats();
      setStats(statsData);
      setDbMode(statsData.dbMode || 'mock');
    } catch (err) {
      console.error("Error fetching surveillance data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Establish WebSocket connection for real-time updates
    const wsUrl = window.location.hostname === 'localhost' ? 'ws://localhost:8000/ws' : `wss://${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'REPORT_ADDED') {
          setReports(prev => [message.data, ...prev]);
          // We can also re-fetch stats completely to update the dashboard charts
          getDashboardStats().then(setStats);
        } else if (message.type === 'REPORT_UPDATED') {
          setReports(prev => prev.map(r => r.id === message.data.id ? message.data : r));
          getDashboardStats().then(setStats);
        }
      } catch (err) {
        console.error("Error parsing websocket message", err);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard stats={stats} reports={reports} setActivePage={setActivePage} />;
      case 'upload':
        return <Upload onDetectionSuccess={fetchData} />;
      case 'reports':
        return <Reports reports={reports} isLoading={isLoading} onRefresh={fetchData} role={role} />;
      case 'map':
        return <Map reports={reports} isLoading={isLoading} />;
      case 'about':
        return <About />;
      default:
        return <Dashboard stats={stats} reports={reports} setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Top Navigation */}
      <Navbar dbMode={dbMode} role={role} setRole={setRole} />
      
      {/* Sidebar + Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} setActivePage={setActivePage} role={role} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
