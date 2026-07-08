import React from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Mail, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import { getImageUrl } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const Dashboard = ({ stats, reports, setActivePage }) => {
  if (!stats) return null;

  const { totalReports, pending, resolved, emailsSent, todayReports, issueCounts, history } = stats;

  // Recharts color mapping
  const COLORS = ['#FF5252', '#FFD740', '#29B6F6', '#66BB6A'];
  
  // Format data for Recharts Pie Chart
  const pieData = Object.keys(issueCounts).map(key => ({
    name: key,
    value: issueCounts[key]
  })).filter(item => item.value > 0);

  // Fallback pie data if empty
  const formattedPieData = pieData.length > 0 ? pieData : [
    { name: 'Pothole', value: 0 },
    { name: 'Street Light Fault', value: 0 },
    { name: 'Drainage Overflow', value: 0 },
    { name: 'Fallen Tree', value: 0 }
  ];

  // Stats cards metadata
  const cardData = [
    { title: 'Total Incidents', value: totalReports, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Today\'s Alerts', value: todayReports, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Active / Pending', value: pending, icon: Clock, color: 'text-red-500', bg: 'bg-red-500/10' },
    { title: 'Resolved Issues', value: resolved, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Title */}
      <div>
        <h2 className="text-xl font-extrabold text-white">Surveillance Dashboard</h2>
        <p className="text-xs text-dark-400">Real-time incident intelligence and municipal routing</p>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-4 gap-4">
        {cardData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              key={idx} 
              className="glass-panel rounded-2xl p-5 border border-dark-800/60 bg-dark-900/20 hover:border-dark-700/50 hover:bg-dark-900/40 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-dark-400 block tracking-wide uppercase">{card.title}</span>
                  <span className="text-3xl font-extrabold text-white mt-2 block tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">
                    {card.value}
                  </span>
                </div>
                <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center border border-dark-800/40 group-hover:rotate-6 transition-transform duration-300`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Trend Bar Chart */}
        <div className="glass-panel col-span-2 rounded-2xl p-5 border border-dark-800/60 bg-dark-900/20 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Incident Frequency Trends</h3>
          <div className="h-64 w-full">
            {history && history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#8c93a0" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8c93a0" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e2025', borderColor: '#2d3039', borderRadius: '0.5rem', fontSize: '11px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-dark-500">No trend log data.</div>
            )}
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="glass-panel rounded-2xl p-5 border border-dark-800/60 bg-dark-900/20 space-y-4 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Issue Breakdown</h3>
          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {formattedPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e2025', borderColor: '#2d3039', borderRadius: '0.5rem', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center total */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-white leading-none">{totalReports}</span>
              <span className="text-[10px] text-dark-400 mt-1 uppercase font-semibold">Alerts</span>
            </div>
          </div>
          
          {/* Custom Legends */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-dark-300">
            {formattedPieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate">{item.name}: <span className="text-white font-bold">{item.value}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts Feed */}
      <div className="glass-panel rounded-2xl p-5 border border-dark-800/60 bg-dark-900/20 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Camera Detections</h3>
          <button 
            onClick={() => setActivePage('reports')}
            className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All Logs
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {reports && reports.slice(0, 4).map((report, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + (idx * 0.1) }}
              key={report.id}
              className="glass-card rounded-xl overflow-hidden border border-dark-800/50 flex flex-col justify-between"
            >
              {/* Image box */}
              <div className="aspect-video relative overflow-hidden bg-dark-950">
                <img 
                  src={getImageUrl(report.image)} 
                  alt={report.issueType}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <StatusBadge status={report.status} />
                </div>
              </div>
              
              {/* Info Box */}
              <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{report.issueType}</h4>
                  <p className="text-[10px] text-dark-400 line-clamp-1 mt-0.5">{report.location.address}</p>
                </div>
                
                <div className="flex items-center justify-between border-t border-dark-800/60 pt-2 text-[9px] text-dark-500 font-mono">
                  <span>Confidence: {Math.round(report.confidence <= 1.0 ? report.confidence * 100 : report.confidence)}%</span>
                  {report.emailSent && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                      <Mail className="h-3 w-3" /> Sent
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {(!reports || reports.length === 0) && (
            <div className="col-span-4 text-center py-6 text-xs text-dark-500">
              No recent detections recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
