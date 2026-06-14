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
  ResponsiveContainer
} from 'recharts';
import { ArrowLeft, Calendar, BarChart3, Clock, Loader2, Sparkles, CornerDownRight } from 'lucide-react';

export default function PublicStatsPage() {
  const { shortCode } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['publicAnalytics', shortCode],
    queryFn: async () => {
      const res = await analyticsAPI.getPublicStats(shortCode);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-muted-foreground font-semibold">Loading public metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
        <div className="glass max-w-md rounded-2xl p-8 border border-border">
          <h2 className="text-xl font-bold">Stats not found</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Unable to retrieve public stats for '/{shortCode}'. The link might not exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { url, stats } = data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Brand Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Public Link Stats
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          /{url.shortCode}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-lg mx-auto truncate flex items-center justify-center gap-1 font-mono">
          <CornerDownRight className="h-4 w-4 text-indigo-500 shrink-0" />
          {url.originalUrl}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        <div className="glass rounded-xl p-5 border border-border text-center">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Clicks</p>
          <p className="text-4xl font-extrabold tracking-tight mt-1 text-indigo-500">
            {url.clicks}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Total redirection events</p>
        </div>
        <div className="glass rounded-xl p-5 border border-border text-center">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Created Date</p>
          <p className="text-xl font-bold tracking-tight mt-3 text-foreground">
            {new Date(url.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </p>
          <p className="text-[10px] text-muted-foreground mt-2.5">Initial short link creation</p>
        </div>
      </div>

      {/* Trend Graph */}
      <div className="glass rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">Daily Click Trends</h2>
            <p className="text-xs text-muted-foreground">Click volume tracking over the last 7 days.</p>
          </div>
          <Clock className="h-5 w-5 text-indigo-500" />
        </div>
        <div className="h-80 w-full">
          {stats.clickTrends.length === 0 || url.clicks === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No click trends logged for this link yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.clickTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="publicClickColor" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#publicClickColor)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Brand CTA */}
      <div className="text-center pt-8">
        <p className="text-sm text-muted-foreground mb-4">Want to track your own links with advanced segmentation?</p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500"
        >
          <BarChart3 className="h-4.5 w-4.5" />
          Create Your Free SmartLink Account
        </Link>
      </div>
    </div>
  );
}
