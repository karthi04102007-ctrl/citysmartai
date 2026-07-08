import React from 'react';
import { Mail, Check, AlertTriangle, Trash2, MapPin } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ReportTable = ({ reports, onStatusChange, onDelete, role = 'admin' }) => {
  if (!reports || reports.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-dark-800/60 bg-dark-900/10">
        <AlertTriangle className="h-8 w-8 text-dark-500 mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-white">No surveillance reports logged</h4>
        <p className="text-xs text-dark-400 mt-1">Upload images in the "Analyze Upload" tab to populate reports.</p>
      </div>
    );
  }

  // Format date utility
  const formatDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-dark-800/60 overflow-hidden bg-dark-900/20">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-950 border-b border-dark-800 text-dark-400 text-xs font-semibold uppercase tracking-wider">
              <th className="py-4 px-4">Issue</th>
              <th className="py-4 px-4">Location / Address</th>
              <th className="py-4 px-4">Confidence</th>
              <th className="py-4 px-4">Reported At</th>
              <th className="py-4 px-4 text-center">Alert</th>
              <th className="py-4 px-4">Severity / Cost</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800/40 text-xs text-dark-200">
            {reports.map((report) => (
              <tr 
                key={report.id}
                className="hover:bg-dark-900/30 transition-colors group"
              >
                {/* Issue Type */}
                <td className="py-4 px-4 font-semibold text-white">
                  <div className="flex flex-col">
                    <span>{report.issueType}</span>
                    <span className="text-[10px] text-dark-500 font-normal mt-0.5 max-w-[150px] truncate">{report.authority}</span>
                  </div>
                </td>

                {/* Coordinates & Address */}
                <td className="py-4 px-4 max-w-xs">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-dark-100 truncate max-w-[200px]">{report.location.address || 'Unknown address'}</p>
                      <p className="text-[10px] text-dark-500 mt-0.5">Lat: {report.location.latitude.toFixed(4)}, Lon: {report.location.longitude.toFixed(4)}</p>
                    </div>
                  </div>
                </td>

                {/* Confidence */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {report.confidence <= 1.0 ? intVal(report.confidence * 100) : intVal(report.confidence)}%
                    </span>
                    <div className="h-1.5 w-16 bg-dark-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          report.confidence >= 0.90 || report.confidence >= 90 ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${report.confidence <= 1.0 ? report.confidence * 100 : report.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </td>

                {/* Date */}
                <td className="py-4 px-4 text-dark-400 font-medium">
                  {formatDate(report.reportedAt)}
                </td>

                {/* Email Sent Icon */}
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center border ${
                      report.emailSent
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-dark-800 text-dark-500 border-dark-700/30'
                    }`} title={report.emailSent ? 'Email alert dispatched' : 'Alert not dispatched'}>
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </td>

                {/* Severity / Cost */}
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold w-max ${
                      report.severity === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      report.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {report.severity || 'Medium'}
                    </span>
                    <span className="text-[10px] text-dark-300 font-mono">
                      ${report.costEstimate || 0}
                    </span>
                  </div>
                </td>

                {/* Interactive Status Selector */}
                <td className="py-4 px-4">
                  <select
                    value={report.status}
                    onChange={(e) => onStatusChange(report.id, e.target.value)}
                    disabled={role === 'citizen'}
                    className={`bg-dark-900 border border-dark-800 text-dark-200 rounded-lg py-1 px-2.5 font-medium focus:outline-none focus:border-blue-500/40 text-xs shadow-sm ${role === 'citizen' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </td>

                {/* Delete button */}
                <td className="py-4 px-4 text-right">
                  {role === 'admin' && (
                    <button
                      onClick={() => onDelete(report.id)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-dark-900 hover:bg-red-500/10 hover:text-red-400 text-dark-400 border border-dark-800 hover:border-red-500/20 transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                      title="Delete report"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Quick helper to safely get integer confidence
const intVal = (val) => Math.round(parseFloat(val));

export default ReportTable;
