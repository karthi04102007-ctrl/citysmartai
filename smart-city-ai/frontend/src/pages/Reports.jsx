import React, { useState } from 'react';
import { RefreshCw, ListCollapse } from 'lucide-react';
import ReportTable from '../components/ReportTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { updateReportStatus, deleteReport } from '../services/api';

const Reports = ({ reports, isLoading, onRefresh }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStatusChange = async (id, newStatus) => {
    setIsUpdating(true);
    setErrorMessage('');
    try {
      await updateReportStatus(id, newStatus);
      onRefresh(); // Refresh logs
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to update report status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this incident report from municipal records?')) {
      return;
    }
    
    setIsUpdating(true);
    setErrorMessage('');
    try {
      await deleteReport(id);
      onRefresh();
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to delete report.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white font-sans">Surveillance Incident Logs</h2>
          <p className="text-xs text-dark-400">Manage, inspect, and transition statuses of detected anomalies</p>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={isLoading || isUpdating}
          className="flex items-center gap-2 rounded-xl bg-dark-900 border border-dark-800/80 hover:border-dark-700 hover:bg-dark-800 text-xs font-semibold px-4 py-2 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {errorMessage && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <span className="font-bold">Error:</span> {errorMessage}
        </div>
      )}

      {/* Main Logs Table */}
      {isLoading ? (
        <div className="glass-panel rounded-2xl border border-dark-800/60 p-12">
          <LoadingSpinner message="Retrieving database entries..." />
        </div>
      ) : (
        <ReportTable 
          reports={reports} 
          onStatusChange={handleStatusChange} 
          onDelete={handleDelete} 
        />
      )}
    </div>
  );
};

export default Reports;
