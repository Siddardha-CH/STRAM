import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Trash2, ExternalLink, FileCode2, CheckCircle2 } from 'lucide-react';
import { reviewApi } from '../api';
import type { ReviewHistory } from '../types';
import toast from 'react-hot-toast';

interface HistoryProps {
    onLoadReview: (id: number) => void;
}

const LANG_ICONS: Record<string, string> = {
    python: '🐍', javascript: '🟨', java: '☕', cpp: '⚙️'
};

const scoreColor = (s: number) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';
const scoreBg = (s: number) => s >= 80 ? 'bg-green-500/10 border-green-500/20' : s >= 60 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20';

export const History: React.FC<HistoryProps> = ({ onLoadReview }) => {
    const [reviews, setReviews] = useState<ReviewHistory[]>([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        reviewApi.list(50).then(setReviews).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this review?')) return;
        try {
            await reviewApi.delete(id);
            setReviews(prev => prev.filter(r => r.id !== id));
            toast.success('Review deleted');
        } catch {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="p-6 h-full" style={{ minHeight: 'calc(100vh - 73px)' }}>
            <div className="glass-card rounded-2xl p-6 border-white/5 shadow-2xl shadow-black/20 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                        <Clock className="w-5 h-5 text-brand-400" /> Review History
                    </h3>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface-800 text-gray-400 border border-white/5">{reviews.length} reviews</span>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-2 border-surface-700 border-t-brand-500 rounded-full loader-spin" />
                            <p className="text-sm text-gray-500 animate-pulse">Loading history...</p>
                        </div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mb-4">
                            <FileCode2 className="w-8 h-8 text-gray-700" />
                        </div>
                        <p className="text-sm font-medium text-gray-400">No reviews found</p>
                        <p className="text-xs text-gray-600 mt-1">Start a new review to see it here.</p>
                    </div>
                ) : (
                    <div className="space-y-3 overflow-y-auto pr-2 -mr-2">
                        {reviews.map((r, i) => (
                            <motion.div
                                key={r.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => onLoadReview(r.id)}
                                className="group flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5 hover:shadow-lg hover:shadow-black/20 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/0 via-brand-500/0 to-brand-500/0 group-hover:via-brand-500/5 transition-all duration-500" />

                                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center text-2xl flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                    {LANG_ICONS[r.language] ?? '📄'}
                                </div>

                                <div className="flex-1 min-w-0 relative">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-sm font-bold text-white capitalize group-hover:text-brand-200 transition-colors">{r.language}</span>
                                        <span className="text-xs text-gray-600">•</span>
                                        <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                                            {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {r.critical_count > 0 && <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 rounded-full px-2 py-0.5">{r.critical_count} critical</span>}
                                        {r.high_count > 0 && <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-2 py-0.5">{r.high_count} high</span>}
                                        {r.medium_count > 0 && <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full px-2 py-0.5">{r.medium_count} medium</span>}
                                        {r.low_count > 0 && <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5">{r.low_count} low</span>}
                                        {r.critical_count === 0 && r.high_count === 0 && r.medium_count === 0 && r.low_count === 0 && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> No issues</span>
                                        )}
                                    </div>
                                </div>

                                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border ${scoreBg(r.score)} flex-shrink-0 group-hover:scale-105 transition-transform shadow-lg`}>
                                    <span className={`text-xl font-black ${scoreColor(r.score)}`}>{r.score}</span>
                                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Score</span>
                                </div>

                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 bg-surface-950/80 backdrop-blur-sm p-1 rounded-lg border border-white/5 shadow-xl">
                                    <button onClick={(e) => { e.stopPropagation(); onLoadReview(r.id); }}
                                        className="p-2 rounded-lg hover:bg-brand-500/20 text-gray-400 hover:text-brand-300 transition-colors" title="View Review">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                    <button onClick={(e) => handleDelete(r.id, e)}
                                        className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors" title="Delete Review">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
