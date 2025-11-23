import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Eye, Activity, Share2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { AnalyticsMetric, ChartDataPoint } from '../types';
import { api, ConnectedAccount, supabase } from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMOGRAPHICS_DATA = [
  { name: '18-24', value: 35 },
  { name: '25-34', value: 45 },
  { name: '35-44', value: 15 },
  { name: '45+', value: 5 },
];

const MetricCard: React.FC<{ metric: AnalyticsMetric; icon: React.ReactNode }> = ({ metric, icon }) => (
  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-700/50 rounded-lg text-indigo-400">
        {icon}
      </div>
      <span className={`flex items-center text-sm font-medium ${metric.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
        {metric.change >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
        {Math.abs(metric.change)}%
      </span>
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{metric.name}</h3>
    <p className="text-2xl font-bold text-white mt-1">
      {metric.name.includes('Rate') ? `${metric.value}%` : metric.value.toLocaleString()}
    </p>
    <p className="text-slate-500 text-xs mt-1">{metric.period}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [engagementData, setEngagementData] = useState<ChartDataPoint[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, e, c] = await Promise.all([
        api.getDashboardMetrics(),
        api.getEngagementData(),
        api.getConnectedAccounts()
      ]);
      setMetrics(m);
      setEngagementData(e);
      setConnectedAccounts(c);
    } catch (error: any) {
      console.error("Failed to load dashboard data", error);
      setError(error.message || "Failed to load analytics data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Real-time updates via Supabase Subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('realtime-dashboard')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'posts', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
          console.log('Real-time update received!', payload);
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading && metrics.length === 0) return (
    <div className="p-10 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p>Loading Analytics...</p>
    </div>
  );

  const hasConnections = connectedAccounts.some(acc => acc.connected);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          {hasConnections ? (
            <span className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Updates
            </span>
          ) : (
            <Link to="/connect" className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
              <AlertCircle className="w-3 h-3" />
              Connect Accounts
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center justify-between text-rose-400 animate-fade-in">
            <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
            </div>
            <button 
                onClick={loadDashboardData} 
                className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-xs font-medium transition-colors"
            >
                <RefreshCw className="w-3 h-3" />
                Retry
            </button>
        </div>
      )}

      {!hasConnections && !error && (
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-6 rounded-xl flex items-center justify-between">
            <div>
                <h3 className="text-white font-semibold">No Data Sources Connected</h3>
                <p className="text-slate-300 text-sm mt-1">Connect your social media accounts to see real-time analytics.</p>
            </div>
            <Link to="/connect" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Connect Now
            </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.length > 0 ? (
          <>
            <MetricCard metric={metrics[0]} icon={<Eye className="w-5 h-5" />} />
            <MetricCard metric={metrics[1]} icon={<Activity className="w-5 h-5" />} />
            <MetricCard metric={metrics[2]} icon={<Users className="w-5 h-5" />} />
            <MetricCard metric={metrics[3]} icon={<Share2 className="w-5 h-5" />} />
          </>
        ) : !error && (
          [1,2,3,4].map(i => (
             <div key={i} className="h-32 bg-slate-800 rounded-xl animate-pulse"></div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-6">Engagement Trends (Last 7 Posts)</h3>
          <div className="h-[300px]">
            {engagementData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-2">
                <BarChart className="w-8 h-8 opacity-50"/>
                <span>No engagement data yet. Connect accounts or create posts.</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-6">Audience Demographics</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMOGRAPHICS_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={50} tick={{fontSize: 12}} />
                <Tooltip 
                   cursor={{fill: '#334155', opacity: 0.2}}
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                />
                <Bar dataKey="value" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;