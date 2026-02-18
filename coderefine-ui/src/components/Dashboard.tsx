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
        className="glass-card rounded-2xl p-5 hover:border-brand-500/30 transition-colors"
    >
        <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
        </div>
        <p className="text-3xl font-bold text-white">{value}</p>
    </motion.div>
);

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onLoadReview }) => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recent, setRecent] = useState<ReviewHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([reviewApi.stats(), reviewApi.list(5)])
            .then(([s, r]) => { setStats(s); setRecent(r); })
            .finally(() => setLoading(false));
    }, []);

    const scoreColor = (s: number) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Reviews" value={loading ? '—' : stats?.total ?? 0} icon={<FileCode2 className="w-4 h-4 text-brand-400" />} color="bg-brand-500/10" delay={0} />
                <StatCard label="Avg Score" value={loading ? '—' : stats?.avg_score ?? '—'} icon={<Star className="w-4 h-4 text-green-400" />} color="bg-green-500/10" delay={0.05} />
                <StatCard label="Issues Found" value={loading ? '—' : stats?.total_issues ?? 0} icon={<Bug className="w-4 h-4 text-red-400" />} color="bg-red-500/10" delay={0.1} />
                <StatCard label="Languages" value={loading ? '—' : Object.keys(stats?.languages ?? {}).length} icon={<Globe className="w-4 h-4 text-purple-400" />} color="bg-purple-500/10" delay={0.15} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Reviews */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-2xl p-5 lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-brand-400" /> Recent Reviews
                        </h3>
                        <button onClick={() => onNavigate('history')} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">View all →</button>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="w-8 h-8 border-2 border-gray-700 border-t-brand-500 rounded-full loader-spin" />
                        </div>
                    ) : recent.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <FileCode2 className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                            <p className="text-sm">No reviews yet.</p>
                            <button onClick={() => onNavigate('review')} className="mt-3 text-brand-400 text-sm hover:underline">Start your first review →</button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recent.map((r) => (
                                <button key={r.id} onClick={() => onLoadReview(r.id)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group">
                                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-lg flex-shrink-0">
                                        {LANG_ICONS[r.language] ?? '📄'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white capitalize">{r.language}</span>
                                            <span className="text-xs text-gray-600">•</span>
                                            <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex gap-3 mt-0.5">
                                            {r.critical_count > 0 && <span className="text-xs text-red-400">{r.critical_count} critical</span>}
                                            {r.high_count > 0 && <span className="text-xs text-orange-400">{r.high_count} high</span>}
                                            {r.medium_count > 0 && <span className="text-xs text-yellow-400">{r.medium_count} medium</span>}
                                        </div>
                                    </div>
                                    <span className={`text-xl font-bold ${scoreColor(r.score)} group-hover:scale-110 transition-transform`}>{r.score}</span>
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
                    className="glass-card rounded-2xl p-5"
                >
                    <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-brand-400" /> Languages Used
                    </h3>
                    {!stats || Object.keys(stats.languages).length === 0 ? (
                        <div className="text-center py-8 text-gray-600 text-sm">No data yet</div>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(stats.languages).sort((a, b) => b[1] - a[1]).map(([lang, count]) => {
                                const pct = Math.round((count / (stats.total || 1)) * 100);
                                return (
                                    <div key={lang}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-300 capitalize flex items-center gap-1.5">{LANG_ICONS[lang]} {lang}</span>
                                            <span className="text-gray-500">{count} ({pct}%)</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ delay: 0.3, duration: 0.8 }}
                                                className="h-full gradient-btn rounded-full"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* CTA */}
                    <button onClick={() => onNavigate('review')}
                        className="gradient-btn w-full mt-6 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> New Review
                    </button>
                </motion.div>
            </div>
        </div>
    );
};
