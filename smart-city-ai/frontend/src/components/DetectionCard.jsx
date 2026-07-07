import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Mail, 
  Send,
  ExternalLink,
  ShieldAlert,
  Loader
} from 'lucide-react';
import { getImageUrl, triggerEmail } from '../services/api';
import EmailStatus from './EmailStatus';

const DetectionCard = ({ result, onDismiss }) => {
  const { issue, confidence, status, reportId, duplicate, message } = result;
  const [emailStatus, setEmailStatus] = useState(result.emailStatus || null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');

  // Class colors
  const badgeColors = {
    'Pothole': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Street Light Fault': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Drainage Overflow': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Fallen Tree': 'bg-green-500/10 text-green-400 border-green-500/20',
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    setEmailMessage('');
    try {
      const res = await triggerEmail(reportId);
      if (res.status === 'success') {
        setEmailStatus(res.emailDetails);
        setEmailMessage('Email sent successfully!');
      } else {
        setEmailMessage(`Failed: ${res.error || 'Unknown error'}`);
      }
    } catch (err) {
      setEmailMessage('Failed to trigger email. Backend offline.');
      console.error(err);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-dark-800/60 bg-dark-900/30 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-bold text-white flex items-center gap-2">
          {duplicate ? (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          )}
          Analysis Results
        </h3>
        <button 
          onClick={onDismiss}
          className="text-xs font-semibold px-3 py-1 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 border border-dark-700/50 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Duplicate Alert Banner */}
      {duplicate && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <span className="font-bold">Duplicate Incident Suppressed:</span> {message}
          </div>
        </div>
      )}

      {/* Image Preview (Annotated) */}
      <div className="relative rounded-xl border border-dark-800 overflow-hidden bg-dark-950/40">
        <img 
          src={getImageUrl(result.aiResults?.annotatedImage)} 
          alt="AI Analysis Feed" 
          className="w-full h-64 object-contain"
        />
        <div className="absolute top-3 left-3 rounded-md bg-dark-950/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-dark-300 border border-dark-800">
          AI Annotations Overlaid
        </div>
        <div className="absolute bottom-3 right-3 rounded-md bg-dark-950/80 px-2.5 py-1.5 text-xs font-semibold text-white border border-dark-800 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          Inference: {result.aiResults?.mode || 'Simulation'}
        </div>
      </div>

      {/* Detail Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-950/30 border border-dark-800/40 rounded-xl p-3.5">
          <span className="text-[10px] uppercase font-bold text-dark-400 block tracking-wider">Classification</span>
          <span className={`inline-block border px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1.5 ${badgeColors[issue] || 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
            {issue}
          </span>
        </div>
        
        <div className="bg-dark-950/30 border border-dark-800/40 rounded-xl p-3.5">
          <span className="text-[10px] uppercase font-bold text-dark-400 block tracking-wider">AI Confidence</span>
          <div className="flex items-end gap-1.5 mt-1">
            <span className="text-xl font-extrabold text-white leading-none">{confidence}%</span>
            <span className="text-xs text-emerald-400 font-semibold mb-0.5">High Confidence</span>
          </div>
        </div>
      </div>

      {/* Email Alert Flow Panel */}
      <div className="border border-dark-800/60 rounded-xl p-4 bg-dark-950/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Municipal Email Dispatch</h4>
          </div>
          
          {/* Manually trigger if not sent, or just resend */}
          <button
            onClick={handleSendEmail}
            disabled={isSendingEmail}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 transition-colors disabled:bg-dark-800 disabled:text-dark-500"
          >
            {isSendingEmail ? (
              <Loader className="h-3 w-3 animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
            <span>Resend Alert</span>
          </button>
        </div>

        {emailMessage && (
          <div className={`text-xs p-2 rounded border ${
            emailMessage.includes('success') 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {emailMessage}
          </div>
        )}

        {/* Email Status Details Display */}
        <EmailStatus emailDetails={emailStatus} />
      </div>
    </div>
  );
};

export default DetectionCard;
