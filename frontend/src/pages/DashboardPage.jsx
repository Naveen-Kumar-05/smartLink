import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { urlAPI } from '../services/api';
import {
  Link2,
  Copy,
  Check,
  QrCode,
  Edit2,
  Trash2,
  BarChart2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
  Calendar,
  AlertCircle,
  Clock,
  ExternalLink,
  Download,
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals & Panels State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [qrModalUrl, setQrModalUrl] = useState(null); // { qrCode, shortUrl, code }
  const [editUrlItem, setEditUrlItem] = useState(null); // url object
  const [deleteUrlItem, setDeleteUrlItem] = useState(null); // url object

  // Clipboard Copied State
  const [copiedId, setCopiedId] = useState(null);
  const [qrCopied, setQrCopied] = useState(false);

  // Form States
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Form States
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editIsExpired, setEditIsExpired] = useState(false);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Bulk States
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkError, setBulkError] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch KPI Stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['urlStatsSummary'],
    queryFn: async () => {
      const res = await urlAPI.getStatsSummary();
      return res.data;
    },
  });

  // Fetch URL Lists
  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['urls', debouncedSearch, filter, page],
    queryFn: async () => {
      const res = await urlAPI.list({
        search: debouncedSearch,
        filter,
        page,
        limit,
      });
      return res.data;
    },
  });

  // Copy Link Handler
  const handleCopyLink = (urlStr, id) => {
    navigator.clipboard.writeText(urlStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy QR Image to Clipboard
  const handleCopyQR = async (base64Png) => {
    try {
      const response = await fetch(base64Png);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy QR code image:', err);
    }
  };

  // Create Single URL Mutation
  const handleCreateUrl = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      await urlAPI.create({
        originalUrl,
        customAlias: customAlias || undefined,
        expiryDate: expiryDate || undefined,
      });
      setOriginalUrl('');
      setCustomAlias('');
      setExpiryDate('');
      setIsCreateOpen(false);
      queryClient.invalidateQueries(['urls']);
      queryClient.invalidateQueries(['urlStatsSummary']);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setCreateLoading(false);
    }
  };

  // Edit URL Mutation
  const handleEditUrl = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);

    try {
      await urlAPI.update(editUrlItem.id, {
        originalUrl: editOriginalUrl,
        expiryDate: editExpiryDate || null,
        isExpired: editIsExpired,
      });
      setEditUrlItem(null);
      queryClient.invalidateQueries(['urls']);
      queryClient.invalidateQueries(['urlStatsSummary']);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update URL');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete URL Mutation
  const handleDeleteUrl = async () => {
    if (!deleteUrlItem) return;
    try {
      await urlAPI.delete(deleteUrlItem.id);
      setDeleteUrlItem(null);
      queryClient.invalidateQueries(['urls']);
      queryClient.invalidateQueries(['urlStatsSummary']);
    } catch (err) {
      alert('Failed to delete link');
    }
  };

  // Parse CSV client-side
  const handleBulkSubmit = (e) => {
    e.preventDefault();
    if (!bulkFile) {
      setBulkError('Please select a CSV file');
      return;
    }
    setBulkError('');
    setBulkLoading(true);
    setBulkResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n');
        
        if (lines.length < 2) {
          throw new Error('CSV must have a header row and at least one data row');
        }

        // Parse header: expect columns like originalUrl, customAlias, expiryDate
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        const originalUrlIdx = headers.findIndex(h => h.toLowerCase() === 'originalurl');
        
        if (originalUrlIdx === -1) {
          throw new Error("CSV must contain an 'originalUrl' header column");
        }

        const customAliasIdx = headers.findIndex(h => h.toLowerCase() === 'customalias');
        const expiryDateIdx = headers.findIndex(h => h.toLowerCase() === 'expirydate');

        const items = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const columns = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          const originalUrlVal = columns[originalUrlIdx];
          
          if (!originalUrlVal) continue;

          items.push({
            originalUrl: originalUrlVal,
            customAlias: customAliasIdx !== -1 ? columns[customAliasIdx] || null : null,
            expiryDate: expiryDateIdx !== -1 ? columns[expiryDateIdx] || null : null,
          });
        }

        if (items.length === 0) {
          throw new Error('No valid rows found in CSV');
        }

        const res = await urlAPI.bulkCreate(items);
        setBulkResult(res.data);
        queryClient.invalidateQueries(['urls']);
        queryClient.invalidateQueries(['urlStatsSummary']);
      } catch (err) {
        setBulkError(err.message || 'Failed to parse or upload CSV');
      } finally {
        setBulkLoading(false);
      }
    };
    reader.readAsText(bulkFile);
  };

  const handleOpenEdit = (item) => {
    setEditUrlItem(item);
    setEditOriginalUrl(item.originalUrl);
    setEditExpiryDate(item.expiryDate ? item.expiryDate.split('T')[0] : '');
    setEditIsExpired(item.isExpired);
  };

  const totalPages = listData ? Math.ceil(listData.total / limit) : 1;

  // Build short URL string helper
  const getShortUrlStr = (shortCode) => {
    return `${window.location.origin.replace('5173', '5000')}/${shortCode}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-8 sm:px-6 lg:px-8">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage, analyze, and scale your active short links.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
          >
            <Upload className="h-4 w-4" />
            Bulk Create
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Link
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total Links', value: statsData?.totalUrls, loading: statsLoading, desc: 'Links generated' },
          { title: 'Total Clicks', value: statsData?.totalClicks, loading: statsLoading, desc: 'Accumulated visits' },
          { title: 'Active Links', value: statsData?.activeUrls, loading: statsLoading, desc: 'Forwarding correctly', color: 'text-green-500' },
          { title: 'Expired Links', value: statsData?.expiredUrls, loading: statsLoading, desc: 'Deactivated clicks', color: 'text-amber-500' },
        ].map((card, idx) => (
          <div key={idx} className="glass rounded-xl p-5 border border-border shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{card.title}</p>
            {card.loading ? (
              <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              <p className={`text-3xl font-extrabold tracking-tight mt-1 ${card.color || ''}`}>
                {card.value ?? 0}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Management Area */}
      <div className="glass rounded-2xl border border-border overflow-hidden shadow-md">
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row gap-4 p-5 border-b border-border bg-secondary/20">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by alias, original URL, short code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex gap-3">
            <div className="relative flex items-center">
              <Filter className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-border bg-background py-2.5 pl-9 pr-8 text-sm focus:border-indigo-500 focus:outline-none cursor-pointer appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="expired">Expired Only</option>
                <option value="most_clicked">Most Clicked</option>
                <option value="recently_created">Recently Created</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Panel */}
        <div className="overflow-x-auto">
          {listLoading ? (
            <div className="p-8 text-center space-y-4">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading active links...</p>
            </div>
          ) : !listData || listData.urls.length === 0 ? (
            <div className="p-12 text-center max-w-sm mx-auto">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-4">
                <Link2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">No links found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjustment filters or create your first short URL today.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">Original Destination</th>
                  <th className="p-4">Short Code / Alias</th>
                  <th className="p-4 text-center">Clicks</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Health</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {listData.urls.map((url) => {
                  const fullShortUrl = getShortUrlStr(url.shortCode);
                  return (
                    <tr key={url.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="p-4 max-w-xs sm:max-w-sm">
                        <div className="truncate font-medium hover:text-indigo-400 transition-colors">
                          <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                            {url.originalUrl}
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-40" />
                          </a>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-indigo-500 font-mono">
                            /{url.shortCode}
                          </span>
                          <button
                            onClick={() => handleCopyLink(fullShortUrl, url.id)}
                            className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                          >
                            {copiedId === url.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold">
                        {url.clicks}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            url.isExpired
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-green-500/10 text-green-500'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${url.isExpired ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                          {url.isExpired ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4">
                        {(() => {
                          const now = new Date();
                          const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                          const expDate = url.expiryDate ? new Date(url.expiryDate) : null;
                          let health = 'Active';
                          let colorClass = 'bg-green-500/10 text-green-500';
                          let dotClass = 'bg-green-500';
                          
                          if (url.isExpired || (expDate && expDate < now)) {
                            health = 'Expired';
                            colorClass = 'bg-red-500/10 text-red-500';
                            dotClass = 'bg-red-500';
                          } else if (expDate && expDate <= next24h) {
                            health = 'Expiring Soon';
                            colorClass = 'bg-yellow-500/10 text-yellow-500';
                            dotClass = 'bg-yellow-500';
                          }
                          
                          return (
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`}></span>
                              {health}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(url.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/analytics/${url.shortCode}`}
                            className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                            title="Analytics"
                          >
                            <BarChart2 className="h-4.5 w-4.5" />
                          </Link>
                          <button
                            onClick={() => setQrModalUrl({ qrCode: url.qrCode, shortUrl: fullShortUrl, code: url.shortCode })}
                            className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                            title="QR Code"
                          >
                            <QrCode className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(url)}
                            className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit URL"
                          >
                            <Edit2 className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => setDeleteUrlItem(url)}
                            className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Row */}
        {listData && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-4 bg-secondary/10">
            <span className="text-xs text-muted-foreground">
              Showing page {page} of {totalPages} ({listData.total} links)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="rounded p-1.5 border border-border bg-background hover:bg-secondary disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                className="rounded p-1.5 border border-border bg-background hover:bg-secondary disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE SINGLE URL DIALOG */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl border border-border relative animate-fade-in bg-background">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-4">Create Short Link</h2>

            {createError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Original Destination URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/very-long-link-path"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2 px-3 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Custom Alias (Optional)</label>
                <div className="flex rounded-lg border border-border overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                  <span className="bg-secondary/40 px-3 py-2 text-sm text-muted-foreground border-r border-border font-mono">/</span>
                  <input
                    type="text"
                    placeholder="portfolio"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    className="w-full bg-background py-2 px-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Expiry Date (Optional)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                  <input
                    type="date"
                    value={expiryDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {createLoading ? 'Shortening...' : 'Generate Short URL'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BULK CSV CREATOR DIALOG */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-border relative animate-fade-in bg-background max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsBulkOpen(false);
                setBulkResult(null);
                setBulkFile(null);
                setBulkError('');
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-2">Bulk URL Upload</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Select a CSV file to generate multiple links at once. CSV format should be:
            </p>
            <div className="bg-secondary/40 p-3 rounded-lg border border-border text-[11px] font-mono text-muted-foreground mb-4">
              originalUrl,customAlias,expiryDate <br />
              https://site.com/bio,mybio, <br />
              https://site.com/shop,,2026-12-31
            </div>

            {bulkError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{bulkError}</span>
              </div>
            )}

            {!bulkResult ? (
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-indigo-500/50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv"
                    required
                    onChange={(e) => setBulkFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <FileSpreadsheet className="h-10 w-10 text-indigo-500 mb-2" />
                    <span className="text-sm font-semibold text-foreground">
                      {bulkFile ? bulkFile.name : 'Select CSV file'}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">Supports files up to 2MB</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bulkLoading}
                  className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {bulkLoading ? 'Uploading and generating...' : 'Upload CSV'}
                </button>
              </form>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-green-500 text-sm">
                  <p className="font-semibold">Successfully parsed CSV file</p>
                  <p className="opacity-95">Created {bulkResult.created.length} short links. Errors: {bulkResult.errors.length}</p>
                </div>

                {bulkResult.errors.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto border border-border rounded-lg p-3 bg-secondary/20">
                    <p className="text-xs font-bold text-destructive">Errors report:</p>
                    {bulkResult.errors.map((err, idx) => (
                      <p key={idx} className="text-[11px] text-muted-foreground">
                        Row {err.row}: {err.error}
                      </p>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsBulkOpen(false);
                    setBulkResult(null);
                    setBulkFile(null);
                  }}
                  className="w-full rounded-lg bg-secondary border border-border py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR CODE PREVIEW DIALOG */}
      {qrModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-border relative animate-fade-in bg-background text-center">
            <button
              onClick={() => setQrModalUrl(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-1">QR Code</h2>
            <p className="text-xs text-muted-foreground mb-6">Scan to visit: {qrModalUrl.shortUrl}</p>

            <div className="mx-auto rounded-xl border border-border bg-white p-3 inline-block shadow-sm">
              <img src={qrModalUrl.qrCode} alt="QR Code" className="h-48 w-48" />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => handleCopyQR(qrModalUrl.qrCode)}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 px-3 text-xs font-semibold hover:bg-secondary transition-colors"
              >
                {qrCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {qrCopied ? 'Copied Image' : 'Copy Image'}
              </button>
              <a
                href={qrModalUrl.qrCode}
                download={`qr-${qrModalUrl.code}.png`}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 px-3 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </a>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DESTINATION DIALOG */}
      {editUrlItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl border border-border relative animate-fade-in bg-background">
            <button
              onClick={() => setEditUrlItem(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-4">Edit Destination URL</h2>

            {editError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Destination URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={editOriginalUrl}
                  onChange={(e) => setEditOriginalUrl(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={editExpiryDate}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="editIsExpired"
                  checked={editIsExpired}
                  onChange={(e) => setEditIsExpired(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="editIsExpired" className="text-sm font-semibold text-muted-foreground cursor-pointer select-none">
                  Manually Expired / Disabled
                </label>
              </div>

              <button
                type="submit"
                disabled={editLoading}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {editLoading ? 'Saving changes...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteUrlItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-border relative animate-fade-in bg-background">
            <h2 className="text-lg font-bold mb-2">Delete Short Link</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <span className="font-semibold text-foreground">/{deleteUrlItem.shortCode}</span>? This action is permanent and all associated analytics metrics will be deleted.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteUrlItem(null)}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUrl}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/10"
              >
                Delete Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
