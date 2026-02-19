import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileCode2, Star, Bug, Globe, Plus, TrendingUp, Clock } from 'lucide-react';
import { reviewApi } from '../api';
import type { Stats, ReviewHistory } from '../types';

interface DashboardProps {
    onNavigate: (s: 'review' | 'history') => void;
    onLoadReview: (id: number) => void;
}

const LANG_ICONS: Record<string, string> = {
    python: '🐍', javascript: '🟨', java: '☕', cpp: '⚙️'
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string; delay: number }> = ({ label, value, icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="glass-card rounded-2xl p-5 hover:border-brand-500/50 transition-all hover:shadow-[0_0_30px_-10px_rgba(124,58,237,0.3)] group"
    >
        <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-brand-200/60 uppercase tracking-wider font-semibold">{label}</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-inner group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
        </div>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </motion.div>
);

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onLoadReview }) => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recent, setRecent] = useState<ReviewHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [s, r] = await Promise.all([reviewApi.stats(), reviewApi.list(5)]);
                setStats(s);
                setRecent(r);
            } catch (e) {
                console.error("Failed to load dashboard data", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const scoreColor = (s: number) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Reviews" value={loading ? '—' : stats?.total ?? 0} icon={<FileCode2 className="w-5 h-5 text-brand-300" />} color="bg-brand-500/20 ring-1 ring-brand-500/30" delay={0} />
                <StatCard label="Avg Score" value={loading ? '—' : stats?.avg_score ?? '—'} icon={<Star className="w-5 h-5 text-accent-400" />} color="bg-accent-500/20 ring-1 ring-accent-500/30" delay={0.05} />
                <StatCard label="Issues Found" value={loading ? '—' : stats?.total_issues ?? 0} icon={<Bug className="w-5 h-5 text-rose-400" />} color="bg-rose-500/20 ring-1 ring-rose-500/30" delay={0.1} />
                <StatCard label="Languages" value={loading ? '—' : Object.keys(stats?.languages ?? {}).length} icon={<Globe className="w-5 h-5 text-emerald-400" />} color="bg-emerald-500/20 ring-1 ring-emerald-500/30" delay={0.15} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Reviews */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-2xl p-5 lg:col-span-2 border-white/5"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-accent-400" /> Recent Reviews
                        </h3>
                        <button onClick={() => onNavigate('history')} className="text-xs font-semibold text-accent-400 hover:text-accent-300 transition-colors uppercase tracking-wider">View all →</button>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="w-8 h-8 border-2 border-surface-800 border-t-accent-500 rounded-full loader-spin" />
                        </div>
                    ) : recent.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <FileCode2 className="w-10 h-10 mx-auto mb-3 text-surface-700" />
                            <p className="text-sm">No reviews yet.</p>
                            <button onClick={() => onNavigate('review')} className="mt-3 text-accent-400 text-sm hover:underline">Start your first review →</button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recent.map((r) => (
                                <button key={r.id} onClick={() => onLoadReview(r.id)}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all text-left group border border-transparent hover:border-white/5">
                                    <div className="w-12 h-12 rounded-xl bg-surface-800/50 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                        {LANG_ICONS[r.language] ?? '📄'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-white capitalize">{r.language}</span>
                                            <span className="text-xs text-gray-600">•</span>
                                            <span className="text-xs text-brand-200/60 font-mono">{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {r.critical_count > 0 && <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{r.critical_count} CRIT</span>}
                                            {r.high_count > 0 && <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{r.high_count} HIGH</span>}
                                            {r.medium_count > 0 && <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{r.medium_count} MED</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className={`text-2xl font-black ${scoreColor(r.score)} group-hover:scale-110 transition-transform`}>{r.score}</span>
                                        <span className="text-[10px] text-gray-500 uppercase font-bold">Score</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Language breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="glass-card rounded-2xl p-5 border-white/5"
                >
                    <h3 className="font-bold text-white flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-emerald-400" /> Languages Used
                    </h3>
                    {!stats || Object.keys(stats.languages).length === 0 ? (
                        <div className="text-center py-8 text-gray-600 text-sm">No data yet</div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(stats.languages).sort((a, b) => b[1] - a[1]).map(([lang, count]) => {
                                const pct = Math.round((count / (stats.total || 1)) * 100);
                                return (
                                    <div key={lang} className="group">
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-brand-100 font-medium capitalize flex items-center gap-2">
                                                <span className="w-6 h-6 rounded bg-surface-800 flex items-center justify-center text-sm shadow-sm">{LANG_ICONS[lang] ?? '📄'}</span>
                                                {lang}
                                            </span>
                                            <span className="text-gray-400 font-mono">{count} <span className="text-gray-600">/</span> {pct}%</span>
                                        </div>
                                        <div className="h-2 bg-surface-800 rounded-full overflow-hidden ring-1 ring-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ delay: 0.3, duration: 0.8 }}
                                                className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full relative overflow-hidden group-hover:brightness-110 transition-all"
                                            >
                                                <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                            </motion.div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* CTA */}
                    <button onClick={() => onNavigate('review')}
                        className="gradient-btn w-full mt-8 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25">
                        <Plus className="w-4 h-4" /> New Review
                    </button>
                </motion.div>
            </div>
        </div>
    );
};
