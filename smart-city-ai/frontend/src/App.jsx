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
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard stats={stats} reports={reports} setActivePage={setActivePage} />;
      case 'upload':
        return <Upload onDetectionSuccess={fetchData} />;
      case 'reports':
        return <Reports reports={reports} isLoading={isLoading} onRefresh={fetchData} />;
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
      <Navbar dbMode={dbMode} />
      
      {/* Sidebar + Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
