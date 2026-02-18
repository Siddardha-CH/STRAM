import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Trash2, ExternalLink, FileCode2 } from 'lucide-react';
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
        <div className="p-6">
            <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-400" /> Review History
                    </h3>
                    <span className="text-xs text-gray-500">{reviews.length} reviews</span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-2 border-gray-700 border-t-brand-500 rounded-full loader-spin" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <FileCode2 className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                        <p className="text-sm">No reviews yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {reviews.map((r, i) => (
                            <motion.div
                                key={r.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => onLoadReview(r.id)}
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-brand-500/20"
                            >
                                <div className="w-11 h-11 rounded-xl glass flex items-center justify-center text-xl flex-shrink-0">
                                    {LANG_ICONS[r.language] ?? '📄'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-white capitalize">{r.language}</span>
                                        <span className="text-xs text-gray-600">•</span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {r.critical_count > 0 && <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-full px-2 py-0.5">{r.critical_count} critical</span>}
                                        {r.high_count > 0 && <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-2 py-0.5">{r.high_count} high</span>}
                                        {r.medium_count > 0 && <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full px-2 py-0.5">{r.medium_count} medium</span>}
                                        {r.low_count > 0 && <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5">{r.low_count} low</span>}
                                        {r.critical_count === 0 && r.high_count === 0 && r.medium_count === 0 && r.low_count === 0 && (
                                            <span className="text-xs text-green-400">✓ No issues</span>
                                        )}
                                    </div>
                                </div>
                                <div className={`text-center px-3 py-1.5 rounded-xl border ${scoreBg(r.score)} flex-shrink-0`}>
                                    <span className={`text-xl font-bold ${scoreColor(r.score)}`}>{r.score}</span>
                                    <p className="text-xs text-gray-600">score</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); onLoadReview(r.id); }}
                                        className="p-2 rounded-lg hover:bg-brand-500/10 text-gray-500 hover:text-brand-400 transition-colors">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                    <button onClick={(e) => handleDelete(r.id, e)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
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
