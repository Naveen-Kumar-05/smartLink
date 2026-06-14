import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import {
  ArrowLeft,
  Calendar,
  Globe,
  Monitor,
  Compass,
  CornerDownRight,
  ExternalLink,
  Loader2,
  Clock,
  MapPin,
  Share2
} from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#e11d48', '#3b82f6'];

export default function AnalyticsPage() {
  const { shortCode } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', shortCode],
    queryFn: async () => {
      const res = await analyticsAPI.getByShortCode(shortCode);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-muted-foreground font-semibold">Retrieving tracking records...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
        <div className="glass max-w-md rounded-2xl p-8 border border-border">
          <h2 className="text-xl font-bold">Analytics not found</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Unable to retrieve analytics for link '/{shortCode}'. It might not exist or you might not be the owner.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { url, stats } = data;

  const totalClicks = url.clicks;
  const recentVisitsCount = stats.recentVisits.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-400 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            /{url.shortCode} <span className="text-lg font-normal text-muted-foreground">analytics</span>
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-1 font-mono truncate max-w-xl">
            <CornerDownRight className="h-4 w-4 text-indigo-500 shrink-0" />
            {url.originalUrl}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/stats/${url.shortCode}`}
            className="flex items-center gap-2 rounded-lg bg-secondary border border-border px-4 py-2.5 text-xs font-bold hover:bg-muted transition-all"
            target="_blank"
          >
            <Share2 className="h-4 w-4 text-indigo-400" />
            View Public Stats
          </Link>
        </div>
      </div>

      {/* KPI Overviews */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Clicks', value: totalClicks, desc: 'Accumulated visits' },
          { title: 'Recent Visits', value: recentVisitsCount, desc: 'Visits tracked this week' },
          { title: 'Primary Device', value: stats.devices[0]?.name || 'N/A', desc: stats.devices[0] ? `${stats.devices[0].value} clicks` : 'No clicks logged yet' },
          { title: 'Primary Browser', value: stats.browsers[0]?.name || 'N/A', desc: stats.browsers[0] ? `${stats.browsers[0].value} clicks` : 'No clicks logged yet' },
        ].map((card, idx) => (
          <div key={idx} className="glass rounded-xl p-5 border border-border shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{card.title}</p>
            <p className="text-3xl font-extrabold tracking-tight mt-1 text-foreground">
              {card.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Click Trend Chart */}
      <div className="glass rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">Daily Click Trends</h2>
            <p className="text-xs text-muted-foreground">Click volume tracking over the last 7 days.</p>
          </div>
          <Clock className="h-5 w-5 text-indigo-500" />
        </div>
        <div className="h-80 w-full">
          {stats.clickTrends.length === 0 || totalClicks === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No click trends to plot yet. Share your link to collect statistics!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.clickTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clickColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#clickColor)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Breakdown */}
        <div className="glass rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 mb-1">
              <Monitor className="h-4.5 w-4.5 text-indigo-500" />
              Devices
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Click volume by device category.</p>
          </div>
          
          <div className="h-48 w-full flex items-center justify-center">
            {stats.devices.length === 0 ? (
              <span className="text-xs text-muted-foreground">No device statistics available.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.devices}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
            {stats.devices.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 font-medium">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {item.name}
                </span>
                <span className="font-bold">{item.value} clicks</span>
              </div>
            ))}
          </div>
        </div>

        {/* Browser Breakdown */}
        <div className="glass rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 mb-1">
              <Compass className="h-4.5 w-4.5 text-indigo-500" />
              Browsers
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Click counts across browser engines.</p>
          </div>
          
          <div className="h-48 w-full flex items-center justify-center">
            {stats.browsers.length === 0 ? (
              <span className="text-xs text-muted-foreground">No browser statistics available.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.browsers} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
            {stats.browsers.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="font-semibold">{item.name}</span>
                <span className="text-muted-foreground">{item.value} clicks</span>
              </div>
            ))}
          </div>
        </div>

        {/* OS Breakdown */}
        <div className="glass rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 mb-1">
              <Globe className="h-4.5 w-4.5 text-indigo-500" />
              Operating Systems
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Click distributions by user OS.</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {stats.operatingSystems.length === 0 ? (
              <span className="text-xs text-muted-foreground">No OS statistics available.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.operatingSystems}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.operatingSystems.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
            {stats.operatingSystems.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 font-medium">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }}></span>
                  {item.name}
                </span>
                <span className="font-bold">{item.value} clicks</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Referrers & Countries tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Geographic location */}
        <div className="glass rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-base font-bold flex items-center gap-2 mb-4">
            <MapPin className="h-4.5 w-4.5 text-indigo-500" />
            Top Countries
          </h3>
          <div className="space-y-3">
            {stats.countries.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No location data captured yet.</p>
            ) : (
              stats.countries.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
                  <span className="font-semibold flex items-center gap-2">
                    <span className="bg-secondary px-1.5 py-0.5 rounded font-mono text-[10px]">{item.name}</span>
                  </span>
                  <span className="font-bold text-indigo-500">{item.value} clicks</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Referrers */}
        <div className="glass rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-base font-bold flex items-center gap-2 mb-4">
            <Share2 className="h-4.5 w-4.5 text-indigo-500" />
            Top Referrers
          </h3>
          <div className="space-y-3">
            {stats.referrers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No referrer records found.</p>
            ) : (
              stats.referrers.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
                  <span className="font-semibold truncate max-w-[200px]">{item.name}</span>
                  <span className="font-bold text-indigo-500">{item.value} clicks</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Visits Table */}
      <div className="glass rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border bg-secondary/10">
          <h3 className="text-base font-bold">Recent Click Logs</h3>
          <p className="text-xs text-muted-foreground">List of the last 10 visits captured by the tracking engine.</p>
        </div>
        <div className="overflow-x-auto">
          {stats.recentVisits.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No individual visit entries found yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Browser & OS</th>
                  <th className="p-4">Device</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Referrer</th>
                  <th className="p-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {stats.recentVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="p-4 font-mono text-[11px] text-muted-foreground">
                      {new Date(visit.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 font-medium">
                      {visit.browser || 'Unknown'} on {visit.operatingSystem || 'Unknown'}
                    </td>
                    <td className="p-4 font-semibold capitalize text-indigo-400">
                      {visit.device || 'Desktop'}
                    </td>
                    <td className="p-4">
                      {visit.city ? `${visit.city}, ` : ''}{visit.country || 'Unknown'}
                    </td>
                    <td className="p-4 truncate max-w-xs" title={visit.referrer}>
                      {visit.referrer}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-muted-foreground">
                      {visit.ipAddress || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
