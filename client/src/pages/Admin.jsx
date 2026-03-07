import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import PageMeta from "@/components/PageMeta";
import AdminDeletedContent from "@/components/AdminDeletedContent";
import {
    Trash2, AlertTriangle, CheckCircle, Shield, Users, Flag,
    BarChart3, Eye, Ban, MessageSquare, FileText, Video,
    Clock, ChevronLeft, ChevronRight, Search, Filter,
    Gavel, ScrollText, Scale, X, AlertCircle, Copy, Hash
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const priorityColors = {
    low: 'secondary', medium: 'warning', high: 'danger', critical: 'danger'
};

const statusColors = {
    pending: 'warning', reviewing: 'default', resolved: 'success', dismissed: 'secondary'
};

const reasonLabels = {
    spam: 'Spam', harassment: 'Harassment', hate_speech: 'Hate Speech',
    nudity: 'Nudity', violence: 'Violence', misinformation: 'Misinformation', other: 'Other'
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
}) : '—';

// ─── Tab Components ──────────────────────────────────────────────────────────

function OverviewTab({ stats, modStats }) {
    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
        { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'text-green-400' },
        { label: 'Total Videos', value: stats.totalVideos, icon: Video, color: 'text-purple-400' },
        { label: 'Pending Reports', value: modStats.pendingReports, icon: Flag, color: 'text-red-400' },
        { label: 'Banned Users', value: modStats.bannedUsers, icon: Ban, color: 'text-orange-400' },
        { label: 'Pending Appeals', value: modStats.pendingAppeals, icon: Scale, color: 'text-yellow-400' },
        { label: 'Resolved Today', value: modStats.resolvedToday, icon: CheckCircle, color: 'text-emerald-400' },
        { label: 'Total Mod Actions', value: modStats.totalLogs, icon: ScrollText, color: 'text-cyan-400' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s, i) => (
                <Card key={i} className="bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 transition-all duration-300">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">{s.label}</p>
                                <p className="text-3xl font-bold text-white mt-1">{s.value ?? '—'}</p>
                            </div>
                            <s.icon className={`w-8 h-8 ${s.color} opacity-80`} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function QueueTab() {
    const [reports, setReports] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState({ status: 'pending', contentType: '', priority: '' });
    const [loading, setLoading] = useState(false);
    const [resolveModal, setResolveModal] = useState(null);
    const [resolveReason, setResolveReason] = useState('');

    const fetchQueue = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 15 });
            if (filters.status) params.append('status', filters.status);
            if (filters.contentType) params.append('contentType', filters.contentType);
            if (filters.priority) params.append('priority', filters.priority);

            const { data } = await axios.get(`${API_URL}/moderation/queue?${params}`, getAuthHeader());
            setReports(data.reports);
            setPagination(data.pagination);
        } catch (err) {
            toast.error('Failed to load moderation queue');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchQueue(); }, [fetchQueue]);

    const handleResolve = async (resolution) => {
        try {
            await axios.put(`${API_URL}/moderation/report/${resolveModal._id}/resolve`, {
                resolution,
                reason: resolveReason
            }, getAuthHeader());
            toast.success(`Report ${resolution} successfully`);
            setResolveModal(null);
            setResolveReason('');
            fetchQueue(pagination.page);
        } catch (err) {
            toast.error('Failed to resolve report');
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <Filter className="w-4 h-4 text-zinc-400" />
                {[['status', ['pending', 'reviewing', 'resolved', 'dismissed', 'all']],
                ['contentType', ['', 'post', 'video', 'comment']],
                ['priority', ['', 'low', 'medium', 'high', 'critical']]
                ].map(([key, options]) => (
                    <select key={key} value={filters[key]}
                        onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                        className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                        {options.map(o => (
                            <option key={o} value={o}>{o ? o.charAt(0).toUpperCase() + o.slice(1).replace('_', ' ') : `All ${key}s`}</option>
                        ))}
                    </select>
                ))}
                <span className="text-sm text-zinc-400 ml-auto">{pagination.total} report(s)</span>
            </div>

            {/* Reports Table */}
            {loading ? (
                <div className="text-center py-12 text-zinc-400">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                    Loading queue...
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg">Queue is clear!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reports.map(r => (
                        <Card key={r._id} className="bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 transition-all">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <Badge variant={priorityColors[r.priority]}>{r.priority}</Badge>
                                            <Badge variant={statusColors[r.status]}>{r.status}</Badge>
                                            <Badge variant="secondary">{r.contentType}</Badge>
                                            <span className="text-xs text-zinc-500">{reasonLabels[r.reason] || r.reason}</span>
                                        </div>
                                        {r.contentSnapshot?.title && (
                                            <p className="text-sm text-white font-medium truncate">{r.contentSnapshot.title}</p>
                                        )}
                                        {r.contentSnapshot?.content && (
                                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{r.contentSnapshot.content}</p>
                                        )}
                                        {r.description && (
                                            <p className="text-xs text-zinc-500 mt-1 italic">{r.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                                            <span>Reported by: {r.reportedBy?.username || 'Unknown'}</span>
                                            <span><Clock className="w-3 h-3 inline mr-1" />{formatDate(r.createdAt)}</span>
                                        </div>
                                    </div>
                                    {r.status === 'pending' || r.status === 'reviewing' ? (
                                        <button
                                            onClick={() => setResolveModal(r)}
                                            className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1.5"
                                        >
                                            <Gavel className="w-4 h-4" /> Review
                                        </button>
                                    ) : (
                                        <span className="text-xs text-zinc-500 shrink-0">
                                            {r.resolution} by {r.resolvedBy?.username || '—'}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button disabled={pagination.page <= 1} onClick={() => fetchQueue(pagination.page - 1)}
                        className="p-2 rounded-lg bg-zinc-800 text-white disabled:opacity-40 hover:bg-zinc-700 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-zinc-400">Page {pagination.page} of {pagination.totalPages}</span>
                    <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchQueue(pagination.page + 1)}
                        className="p-2 rounded-lg bg-zinc-800 text-white disabled:opacity-40 hover:bg-zinc-700 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Resolve Modal */}
            {resolveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setResolveModal(null)}>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Gavel className="w-5 h-5 text-blue-400" /> Resolve Report
                            </h3>
                            <button onClick={() => setResolveModal(null)} className="text-zinc-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mb-4 p-3 bg-zinc-800 rounded-lg">
                            <p className="text-sm text-zinc-300">{resolveModal.contentSnapshot?.content || resolveModal.contentSnapshot?.title || 'No preview'}</p>
                            <p className="text-xs text-zinc-500 mt-1">Type: {resolveModal.contentType} | Reason: {reasonLabels[resolveModal.reason]}</p>
                        </div>
                        <textarea
                            value={resolveReason}
                            onChange={e => setResolveReason(e.target.value)}
                            placeholder="Add a note (optional)..."
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none mb-4 resize-none"
                            rows={2}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleResolve('approved')}
                                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
                                <CheckCircle className="w-4 h-4" /> Approve
                            </button>
                            <button onClick={() => handleResolve('rejected')}
                                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium transition-colors">
                                <X className="w-4 h-4" /> Dismiss
                            </button>
                            <button onClick={() => handleResolve('warned')}
                                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium transition-colors">
                                <AlertTriangle className="w-4 h-4" /> Warn User
                            </button>
                            <button onClick={() => handleResolve('deleted')}
                                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
                                <Trash2 className="w-4 h-4" /> Delete Content
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function UsersTab() {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [banModal, setBanModal] = useState(null);
    const [banReason, setBanReason] = useState('');
    const [banDuration, setBanDuration] = useState('');

    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 15 });
            if (searchQuery) params.append('search', searchQuery);
            if (userFilter) params.append('filter', userFilter);

            const { data } = await axios.get(`${API_URL}/admin/users?${params}`, getAuthHeader());
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, userFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleBan = async () => {
        if (!banModal) return;
        try {
            await axios.post(`${API_URL}/admin/users/${banModal._id}/ban`, {
                reason: banReason || 'Policy violation',
                duration: banDuration ? parseInt(banDuration) : null
            }, getAuthHeader());
            toast.success(`User ${banModal.username} has been ${banDuration ? 'suspended' : 'banned'}`);
            setBanModal(null);
            setBanReason('');
            setBanDuration('');
            fetchUsers(pagination.page);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to ban user');
        }
    };

    const handleUnban = async (userId, username) => {
        try {
            await axios.post(`${API_URL}/admin/users/${userId}/unban`, {}, getAuthHeader());
            toast.success(`${username} has been unbanned`);
            fetchUsers(pagination.page);
        } catch (err) {
            toast.error('Failed to unban user');
        }
    };

    const handleWarn = async (userId, username) => {
        const reason = prompt(`Enter warning reason for ${username}:`);
        if (!reason) return;
        try {
            await axios.post(`${API_URL}/admin/users/${userId}/warn`, { reason }, getAuthHeader());
            toast.success(`Warning issued to ${username}`);
            fetchUsers(pagination.page);
        } catch (err) {
            toast.error('Failed to warn user');
        }
    };

    return (
        <div className="space-y-4">
            {/* Search & Filter */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text" value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                </div>
                <select value={userFilter} onChange={e => setUserFilter(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:border-blue-500 outline-none">
                    <option value="">All Users</option>
                    <option value="banned">Banned</option>
                    <option value="warned">Warned</option>
                </select>
                <span className="text-sm text-zinc-400 ml-auto">{pagination.total} user(s)</span>
            </div>

            {/* Users List */}
            {loading ? (
                <div className="text-center py-12 text-zinc-400">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                </div>
            ) : (
                <div className="space-y-2">
                    {users.map(u => (
                        <Card key={u._id} className="bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 transition-all">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {u.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-medium truncate">{u.username}</p>
                                            <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {u.isBanned && <Badge variant="danger">Banned</Badge>}
                                            {u.isAdmin && <Badge variant="default">Admin</Badge>}
                                            {u.role === 'moderator' && <Badge variant="success">Moderator</Badge>}
                                            {u.warnings?.length > 0 && (
                                                <Badge variant="warning">{u.warnings.length} warning{u.warnings.length > 1 ? 's' : ''}</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {!u.isAdmin && !u.isBanned && (
                                            <>
                                                <button onClick={() => handleWarn(u._id, u.username)}
                                                    className="px-3 py-1.5 bg-yellow-600/20 text-yellow-400 text-xs rounded-lg hover:bg-yellow-600/30 transition-colors">
                                                    Warn
                                                </button>
                                                <button onClick={() => { setBanModal(u); setBanReason(''); setBanDuration(''); }}
                                                    className="px-3 py-1.5 bg-red-600/20 text-red-400 text-xs rounded-lg hover:bg-red-600/30 transition-colors">
                                                    Ban
                                                </button>
                                            </>
                                        )}
                                        {u.isBanned && (
                                            <button onClick={() => handleUnban(u._id, u.username)}
                                                className="px-3 py-1.5 bg-green-600/20 text-green-400 text-xs rounded-lg hover:bg-green-600/30 transition-colors">
                                                Unban
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {u.isBanned && u.banReason && (
                                    <p className="text-xs text-red-400 mt-2 pl-13">
                                        <AlertCircle className="w-3 h-3 inline mr-1" />
                                        Ban reason: {u.banReason}
                                        {u.bannedUntil && ` (until ${formatDate(u.bannedUntil)})`}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button disabled={pagination.page <= 1} onClick={() => fetchUsers(pagination.page - 1)}
                        className="p-2 rounded-lg bg-zinc-800 text-white disabled:opacity-40 hover:bg-zinc-700 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-zinc-400">Page {pagination.page} of {pagination.totalPages}</span>
                    <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchUsers(pagination.page + 1)}
                        className="p-2 rounded-lg bg-zinc-800 text-white disabled:opacity-40 hover:bg-zinc-700 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Ban Modal */}
            {banModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setBanModal(null)}>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Ban className="w-5 h-5 text-red-400" /> Ban {banModal.username}
                        </h3>
                        <div className="space-y-3 mb-4">
                            <input
                                type="text" value={banReason} onChange={e => setBanReason(e.target.value)}
                                placeholder="Reason for ban..."
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 outline-none"
                            />
                            <select value={banDuration} onChange={e => setBanDuration(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-white focus:border-red-500 outline-none">
                                <option value="">Permanent Ban</option>
                                <option value="1">1 Day</option>
                                <option value="3">3 Days</option>
                                <option value="7">1 Week</option>
                                <option value="14">2 Weeks</option>
                                <option value="30">1 Month</option>
                                <option value="90">3 Months</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setBanModal(null)}
                                className="flex-1 py-2.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleBan}
                                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
                                {banDuration ? 'Suspend User' : 'Ban Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function LogsTab() {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [actionFilter, setActionFilter] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchLogs = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (actionFilter) params.append('action', actionFilter);

            const { data } = await axios.get(`${API_URL}/moderation/logs?${params}`, getAuthHeader());
            setLogs(data.logs);
            setPagination(data.pagination);
        } catch (err) {
            toast.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    }, [actionFilter]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const actionIcons = {
        approve: <CheckCircle className="w-4 h-4 text-green-400" />,
        reject: <X className="w-4 h-4 text-zinc-400" />,
        delete: <Trash2 className="w-4 h-4 text-red-400" />,
        warn: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
        ban: <Ban className="w-4 h-4 text-red-400" />,
        unban: <CheckCircle className="w-4 h-4 text-green-400" />,
        suspend: <Clock className="w-4 h-4 text-orange-400" />,
        dismiss: <X className="w-4 h-4 text-zinc-400" />,
        resolve_appeal: <Scale className="w-4 h-4 text-blue-400" />
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:border-blue-500 outline-none">
                    <option value="">All Actions</option>
                    {['approve', 'reject', 'delete', 'warn', 'ban', 'unban', 'suspend', 'dismiss', 'resolve_appeal'].map(a => (
                        <option key={a} value={a}>{a.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-12 text-zinc-400">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                    <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No moderation logs yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {logs.map(log => (
                        <div key={log._id} className="flex items-center gap-3 p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg">
                            <div className="shrink-0">{actionIcons[log.action] || <Gavel className="w-4 h-4 text-zinc-400" />}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white">
                                    <span className="font-medium">{log.moderator?.username || 'System'}</span>
                                    <span className="text-zinc-400"> {log.action.replace('_', ' ')} </span>
                                    <span className="text-zinc-300">{log.targetType}</span>
                                    {log.details?.username && <span className="text-zinc-400"> ({log.details.username})</span>}
                                </p>
                                {log.reason && <p className="text-xs text-zinc-500 truncate">{log.reason}</p>}
                            </div>
                            <span className="text-xs text-zinc-600 shrink-0">{formatDate(log.createdAt)}</span>
                        </div>
                    ))}
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button disabled={pagination.page <= 1} onClick={() => fetchLogs(pagination.page - 1)}
                        className="p-2 rounded-lg bg-zinc-800 text-white disabled:opacity-40 hover:bg-zinc-700 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-zinc-400">Page {pagination.page} of {pagination.totalPages}</span>
                    <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchLogs(pagination.page + 1)}
                        className="p-2 rounded-lg bg-zinc-800 text-white disabled:opacity-40 hover:bg-zinc-700 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

function AppealsTab() {
    const [appeals, setAppeals] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [loading, setLoading] = useState(false);

    const fetchAppeals = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/moderation/appeals?status=${filter}`, getAuthHeader());
            setAppeals(data.appeals);
        } catch (err) {
            toast.error('Failed to load appeals');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { fetchAppeals(); }, [fetchAppeals]);

    const handleResolve = async (appealId, status) => {
        const notes = prompt(`Admin notes for this ${status === 'approved' ? 'approval' : 'rejection'}:`);
        try {
            await axios.put(`${API_URL}/moderation/appeal/${appealId}/resolve`, {
                status,
                adminNotes: notes || ''
            }, getAuthHeader());
            toast.success(`Appeal ${status}`);
            fetchAppeals();
        } catch (err) {
            toast.error('Failed to resolve appeal');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {['pending', 'approved', 'rejected', 'all'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${filter === s
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                            }`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12 text-zinc-400">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                </div>
            ) : appeals.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                    <Scale className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No appeals found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {appeals.map(a => (
                        <Card key={a._id} className="bg-zinc-900/80 border-zinc-800">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-white font-medium">{a.userId?.username || 'Unknown'}</span>
                                            <Badge variant={a.status === 'pending' ? 'warning' : a.status === 'approved' ? 'success' : 'danger'}>
                                                {a.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-zinc-300">{a.reason}</p>
                                        {a.userId?.banReason && (
                                            <p className="text-xs text-red-400 mt-1">
                                                Original ban: {a.userId.banReason}
                                            </p>
                                        )}
                                        <p className="text-xs text-zinc-500 mt-2">
                                            <Clock className="w-3 h-3 inline mr-1" />
                                            Submitted {formatDate(a.createdAt)}
                                        </p>
                                        {a.adminNotes && (
                                            <p className="text-xs text-blue-400 mt-1">Admin notes: {a.adminNotes}</p>
                                        )}
                                    </div>
                                    {a.status === 'pending' && (
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => handleResolve(a._id, 'approved')}
                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                                                Approve
                                            </button>
                                            <button onClick={() => handleResolve(a._id, 'rejected')}
                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors">
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Duplicates Tab ──────────────────────────────────────────────────────────

function DuplicatesTab() {
    const [duplicateStats, setDuplicateStats] = useState({});
    const [duplicateGroups, setDuplicateGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchDuplicateStats = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/duplicates/stats`, getAuthHeader());
            setDuplicateStats(data);
        } catch (err) {
            toast.error('Failed to fetch duplicate statistics');
        }
    }, []);

    const fetchDuplicateGroups = useCallback(async (pageNum = 1) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/duplicates/groups?page=${pageNum}&limit=10`, getAuthHeader());
            setDuplicateGroups(data.duplicateGroups || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (err) {
            toast.error('Failed to fetch duplicate groups');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDuplicateStats();
        fetchDuplicateGroups(page);
    }, [page, fetchDuplicateStats, fetchDuplicateGroups]);

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'Unknown';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-zinc-900/80 border-zinc-800">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">Total Videos</p>
                                <p className="text-3xl font-bold text-white mt-1">{duplicateStats.totalVideos ?? '—'}</p>
                            </div>
                            <Video className="w-8 h-8 text-blue-400 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/80 border-zinc-800">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">Duplicate Groups</p>
                                <p className="text-3xl font-bold text-white mt-1">{duplicateStats.duplicateGroups ?? '—'}</p>
                            </div>
                            <Copy className="w-8 h-8 text-red-400 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/80 border-zinc-800">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">Duplicate Videos</p>
                                <p className="text-3xl font-bold text-white mt-1">{duplicateStats.duplicateVideos ?? '—'}</p>
                            </div>
                            <Hash className="w-8 h-8 text-orange-400 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/80 border-zinc-800">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">Unique Videos</p>
                                <p className="text-3xl font-bold text-white mt-1">{duplicateStats.uniqueVideos ?? '—'}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-400 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Duplicate Groups */}
            <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Copy className="w-5 h-5" />
                        Duplicate Video Groups
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                        </div>
                    ) : duplicateGroups.length === 0 ? (
                        <div className="text-center py-8 text-zinc-400">
                            <Copy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No duplicate groups found</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {duplicateGroups.map((group, groupIndex) => (
                                <div key={group._id} className="border border-zinc-700 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Hash className="w-4 h-4 text-zinc-400" />
                                        <span className="text-sm text-zinc-400 font-mono">
                                            Hash: {group._id.substring(0, 16)}...
                                        </span>
                                        <Badge variant="secondary" className="ml-auto">
                                            {group.count} duplicates
                                        </Badge>
                                    </div>
                                    
                                    <div className="grid gap-3">
                                        {group.videos.map((video, videoIndex) => (
                                            <div key={video._id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-white mb-1">{video.title}</h4>
                                                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                                                        <span>By: {video.postedBy?.username || 'Unknown'}</span>
                                                        <span>{formatDate(video.createdAt)}</span>
                                                        {video.metadata?.duration && (
                                                            <span>{formatDuration(video.metadata.duration)}</span>
                                                        )}
                                                        {video.originalFileSize && (
                                                            <span>{formatFileSize(video.originalFileSize)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={videoIndex === 0 ? "default" : "secondary"}>
                                                        {videoIndex === 0 ? 'Original' : 'Duplicate'}
                                                    </Badge>
                                                    <button
                                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                                        title="Delete duplicate"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-700">
                            <p className="text-sm text-zinc-400">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Main Admin Component ────────────────────────────────────────────────────

export default function Admin() {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({});
    const [modStats, setModStats] = useState({});

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }

                const { data } = await axios.get(`${API_URL}/admin/check-admin`, getAuthHeader());
                if (!data.isAdmin) {
                    toast.error('Access denied. Admin privileges required.');
                    navigate('/');
                    return;
                }
                setIsAdmin(true);

                // Fetch both stat endpoints in parallel
                const [adminRes, modRes] = await Promise.all([
                    axios.get(`${API_URL}/admin/stats`, getAuthHeader()),
                    axios.get(`${API_URL}/moderation/stats`, getAuthHeader()).catch(() => ({ data: {} }))
                ]);
                setStats(adminRes.data);
                setModStats(modRes.data);
            } catch (err) {
                toast.error('Failed to verify admin access');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        checkAccess();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-zinc-400">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'queue', label: 'Moderation Queue', icon: Flag },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'duplicates', label: 'Duplicates', icon: Copy },
        { id: 'deleted', label: 'Deleted Content', icon: Trash2 },
        { id: 'logs', label: 'Mod Logs', icon: ScrollText },
        { id: 'appeals', label: 'Appeals', icon: Scale },
    ];

    return (
        <>
            <PageMeta title="Admin Dashboard | HuddleUp" description="Content moderation and admin controls" />
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-sm text-zinc-400">Content moderation & user management</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}>
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {tab.id === 'queue' && modStats.pendingReports > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{modStats.pendingReports}</span>
                            )}
                            {tab.id === 'appeals' && modStats.pendingAppeals > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-xs bg-yellow-500 text-black rounded-full">{modStats.pendingAppeals}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'overview' && <OverviewTab stats={stats} modStats={modStats} />}
                    {activeTab === 'queue' && <QueueTab />}
                    {activeTab === 'users' && <UsersTab />}
                    {activeTab === 'duplicates' && <DuplicatesTab />}
                    {activeTab === 'deleted' && <AdminDeletedContent />}
                    {activeTab === 'logs' && <LogsTab />}
                    {activeTab === 'appeals' && <AppealsTab />}
                </div>
            </div>
        </>
    );
}
