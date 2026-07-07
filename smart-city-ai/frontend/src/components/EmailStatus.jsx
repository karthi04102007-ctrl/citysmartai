import React, { useState } from 'react';
import { Mail, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

const EmailStatus = ({ emailDetails }) => {
  const [showBody, setShowBody] = useState(true);

  if (!emailDetails) {
    return (
      <div className="flex items-center gap-2 text-xs text-dark-400 py-1">
        <AlertCircle className="h-4 w-4 text-dark-500" />
        <span>No email logs generated for this action. Click "Resend Alert" to dispatch.</span>
      </div>
    );
  }

  const { sent, simulated, to, subject, body, error } = emailDetails;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-dark-300">
          <span className={`h-2 w-2 rounded-full ${sent ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
          <span>Status: {sent ? 'Dispatched' : 'Failed'}</span>
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          simulated 
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        }`}>
          {simulated ? 'Simulation Mode' : 'SMTP Server (Live)'}
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
          <span className="font-bold">Error log:</span> {error}
        </div>
      )}

      {/* Mock Mail UI Envelope */}
      <div className="rounded-xl border border-dark-800 bg-dark-950/80 overflow-hidden shadow-inner">
        {/* Email Header */}
        <div className="bg-dark-900 border-b border-dark-800 p-3 text-xs space-y-1">
          <div className="flex justify-between items-center">
            <div className="text-dark-400 font-medium">
              To: <span className="text-blue-400 font-semibold">{to}</span>
            </div>
            <button 
              type="button"
              onClick={() => setShowBody(!showBody)}
              className="text-[10px] flex items-center gap-1 font-bold text-dark-400 hover:text-dark-200 transition-colors uppercase tracking-wider"
            >
              {showBody ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>Hide Details</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Details</span>
                </>
              )}
            </button>
          </div>
          <div className="text-dark-200 font-semibold truncate">
            Subject: {subject}
          </div>
        </div>

        {/* Email Body */}
        {showBody && (
          <div className="p-3.5 text-xs text-dark-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto bg-dark-950/40">
            {body}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailStatus;
