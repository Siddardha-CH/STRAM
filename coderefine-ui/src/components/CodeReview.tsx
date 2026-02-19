import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Trash2, Copy, Check, ChevronDown, AlertTriangle, AlertCircle, Info, CheckCircle2, ListChecks, Code2, Upload, RefreshCw, Download } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { reviewApi } from '../api';
import type { ReviewResult, Language, ResultTab, Issue } from '../types';
import toast from 'react-hot-toast';

interface CodeReviewProps {
    initialCode?: string;
    initialLanguage?: string;
    initialResult?: ReviewResult;
}

const LANGUAGES: { value: Language; label: string; icon: string }[] = [
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚙️' },
];

const SeverityIcon: React.FC<{ severity: string }> = ({ severity }) => {
    const s = severity.toLowerCase();
    if (s === 'critical') return <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />;
    if (s === 'high') return <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />;
    if (s === 'medium') return <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />;
    return <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />;
};

const severityBadge = (s: string) => {
    const m: Record<string, string> = {
        critical: 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.4)]',
        high: 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_15px_-5px_rgba(249,115,22,0.4)]',
        medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
        low: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    };
    return m[s.toLowerCase()] ?? 'bg-surface-800 text-gray-400';
};

const IssueCard: React.FC<{ issue: Issue; language: string; index: number }> = ({ issue, language, index }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-xl overflow-hidden border border-white/5 bg-surface-900/40 backdrop-blur-sm transition-all hover:border-white/10 ${expanded ? 'ring-1 ring-brand-500/30' : ''}`}
        >
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-start gap-4 p-4 text-left hover:bg-white/5 transition-colors group">
                <SeverityIcon severity={issue.severity} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-white group-hover:text-brand-200 transition-colors">{issue.title}</span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${severityBadge(issue.severity)}`}>{issue.severity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand-200/50">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5">{issue.category}</span>
                        {issue.line_hint && <span className="flex items-center gap-1"><Code2 className="w-3 h-3" /> {issue.line_hint}</span>}
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-300 ${expanded ? 'rotate-180 text-brand-400' : ''}`} />
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-black/20"
                    >
                        <div className="px-4 pb-4 pt-2 space-y-4">
                            <p className="text-sm text-gray-300 leading-relaxed pl-9 border-l-2 border-white/10">{issue.description}</p>
                            {issue.suggestion && (
                                <div className="pl-9">
                                    <p className="text-xs text-green-400 mb-2 font-bold uppercase tracking-wider flex items-center gap-1.5"><Wand2 className="w-3 h-3" /> Suggested Fix</p>
                                    <div className="rounded-lg overflow-hidden border border-white/10 shadow-lg">
                                        <SyntaxHighlighter language={language} style={atomOneDark}
                                            customStyle={{ fontSize: '0.8rem', margin: 0, padding: '1rem', background: '#05050A' }}>
                                            {issue.suggestion}
                                        </SyntaxHighlighter>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 251.2;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#f43f5e';

    return (
        <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-28 h-28 -rotate-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="40" fill="none" stroke="#1e1b4b" strokeWidth="6" />
                <motion.circle
                    cx="45" cy="45" r="40" fill="none" stroke={color} strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{ strokeDasharray: circumference, filter: `drop-shadow(0 0 8px ${color})` }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-black text-white"
                >{score}</motion.span>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Score</span>
            </div>
        </div>
    );
};

export const CodeReview: React.FC<CodeReviewProps> = ({ initialCode = '', initialLanguage = 'python', initialResult }) => {
    const [code, setCode] = useState(initialCode);
    const [language, setLanguage] = useState<Language>(initialLanguage as Language);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ReviewResult | null>(initialResult ?? null);
    const [activeTab, setActiveTab] = useState<ResultTab>('analysis');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (initialCode) setCode(initialCode);
        if (initialLanguage) setLanguage(initialLanguage as Language);
        if (initialResult) { setResult(initialResult); setActiveTab('analysis'); }
    }, [initialCode, initialLanguage, initialResult]);

    const handleReview = async () => {
        if (!code.trim()) { toast.error('Please paste some code first'); return; }
        setLoading(true);
        setResult(null);
        try {
            const data = await reviewApi.submit(code, language);
            setResult(data);
            setActiveTab('analysis');
            toast.success('Analysis complete!');
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Analysis failed. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const copyRefactored = () => {
        if (!result?.refactored_code) return;
        navigator.clipboard.writeText(result.refactored_code);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const applyRefactored = () => {
        if (!result?.refactored_code) return;
        setCode(result.refactored_code);
        toast.success('Source code updated with refactored version!');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setCode(content);
            toast.success(`Loaded ${file.name}`);

            // Auto-detect language if possible
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext) {
                if (['py'].includes(ext)) setLanguage('python');
                else if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) setLanguage('javascript');
                else if (['java'].includes(ext)) setLanguage('java');
                else if (['cpp', 'cc', 'h', 'hpp', 'c'].includes(ext)) setLanguage('cpp');
            }
        };
        reader.readAsText(file);
    };

    const handleDownload = () => {
        if (!result?.refactored_code) return;
        const blob = new Blob([result.refactored_code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Determine extension
        const extMap: Record<string, string> = { python: 'py', javascript: 'js', java: 'java', cpp: 'cpp' };
        const ext = extMap[language] || 'txt';
        a.download = `refactored_code.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Download started!');
    };

    const tabs: { id: ResultTab; label: string; icon: React.ReactNode }[] = [
        { id: 'analysis', label: 'Analysis', icon: <AlertCircle className="w-3.5 h-3.5" /> },
        { id: 'refactored', label: 'Refactored', icon: <Code2 className="w-3.5 h-3.5" /> },
        { id: 'improvements', label: 'Improvements', icon: <ListChecks className="w-3.5 h-3.5" /> },
    ];

    return (
        <div className="p-6 flex gap-6 h-full" style={{ minHeight: 'calc(100vh - 73px)' }}>
            {/* Left: Input */}
            <div className="w-1/2 flex flex-col gap-4">
                <div className="glass-card rounded-2xl p-5 flex flex-col flex-1 border-white/5 shadow-2xl shadow-black/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-brand-400" /> Source Code
                        </h3>
                        <div className="relative group">
                            <select value={language} onChange={e => setLanguage(e.target.value as Language)}
                                className="input-field text-xs rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer bg-surface-900/50 hover:bg-surface-800 transition-colors border-white/10 font-medium text-brand-100">
                                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.icon} {l.label}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-400 pointer-events-none group-hover:text-accent-400 transition-colors" />
                        </div>
                    </div>
                    <div className="flex-1 relative rounded-xl overflow-hidden ring-1 ring-white/10 group-focus-within:ring-brand-500/50 transition-all">
                        <textarea
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            className="absolute inset-0 w-full h-full bg-[#05050A] p-4 font-mono text-sm text-gray-300 focus:outline-none resize-none transition-colors placeholder-gray-700 leading-relaxed"
                            placeholder={`// Paste your ${language} code here...\n\nfunction example() {\n    // Let the AI find the issues!\n}`}
                            spellCheck={false}
                        />
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button onClick={() => { setCode(''); setResult(null); }}
                            className="glass px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Clear
                        </button>
                        <label className="glass px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-brand-300 hover:bg-brand-500/10 hover:border-brand-500/20 transition-all flex items-center gap-2 cursor-pointer">
                            <Upload className="w-4 h-4" /> Upload
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                        <button onClick={handleReview} disabled={loading}
                            className="gradient-btn flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20">
                            {loading
                                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full loader-spin" /> Analyzing...</>
                                : <><Wand2 className="w-4 h-4" /> Analyze & Optimize</>
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Output */}
            <div className="w-1/2 flex flex-col gap-4">
                {/* Tabs */}
                <div className="glass-card rounded-xl p-1 flex gap-1">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`tab-btn flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${activeTab === tab.id ? 'active' : 'text-gray-400 hover:text-gray-200'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Output Panel */}
                <div className="glass-card rounded-2xl flex-1 overflow-hidden relative" style={{ minHeight: '540px' }}>
                    {/* Placeholder */}
                    {!loading && !result && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-4">
                                <Wand2 className="w-8 h-8 text-gray-700" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-500">Ready to Analyze</h3>
                            <p className="text-sm text-gray-600 mt-2 max-w-xs">Paste your code on the left and click Analyze & Optimize.</p>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-800/90 z-10">
                            <div className="relative w-16 h-16 mb-4">
                                <div className="w-16 h-16 border-4 border-gray-700 border-t-brand-500 rounded-full loader-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Wand2 className="w-5 h-5 text-brand-400" />
                                </div>
                            </div>
                            <p className="text-white font-semibold">Analyzing your code...</p>
                            <p className="text-gray-400 text-sm mt-1">Powered by Llama 3.3 70B via Groq</p>
                        </div>
                    )}

                    {/* Results */}
                    {result && (
                        <div className="h-full overflow-y-auto">
                            <AnimatePresence mode="wait">
                                {/* Analysis Tab */}
                                {activeTab === 'analysis' && (
                                    <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 space-y-6">
                                        {/* Score + Summary */}
                                        <div className="glass rounded-2xl p-6 flex items-center gap-6 border-brand-500/10 bg-gradient-to-br from-white/5 to-transparent">
                                            <ScoreRing score={result.summary.score} />
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-2">Analysis Summary</h3>
                                                <p className="text-sm text-brand-100/80 leading-relaxed mb-4">{result.summary.overview}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { label: 'Critical', count: result.summary.critical, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
                                                        { label: 'High', count: result.summary.high, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
                                                        { label: 'Medium', count: result.summary.medium, color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
                                                        { label: 'Low', count: result.summary.low, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                                                    ].map(s => (
                                                        <span key={s.label} className={`text-xs px-3 py-1 rounded-full border ${s.color} font-medium tracking-wide`}>
                                                            <strong className="mr-1">{s.count}</strong> {s.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Issues */}
                                        {result.issues.length === 0 ? (
                                            <div className="text-center py-8 text-green-400">
                                                <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                                                <p className="font-semibold">No issues found! Excellent code.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {result.issues.map((issue, i) => (
                                                    <IssueCard key={i} issue={issue} language={language} index={i} />
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Refactored Tab */}
                                {activeTab === 'refactored' && (
                                    <motion.div key="refactored" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 h-full flex flex-col">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-sm font-semibold text-gray-300">Optimized Code</h4>
                                            <div className="flex gap-2">
                                                <button onClick={handleDownload}
                                                    className="glass px-3 py-1.5 rounded-lg text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors">
                                                    <Download className="w-3.5 h-3.5" /> Download
                                                </button>
                                                <button onClick={applyRefactored}
                                                    className="glass px-3 py-1.5 rounded-lg text-xs text-green-400 hover:text-green-300 flex items-center gap-1.5 transition-colors">
                                                    <RefreshCw className="w-3.5 h-3.5" /> Replace Source
                                                </button>
                                                <button onClick={copyRefactored}
                                                    className="glass px-3 py-1.5 rounded-lg text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1.5 transition-colors">
                                                    {copied ? <><Check className="w-3.5 h-3.5 text-green-400" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-auto rounded-xl">
                                            <SyntaxHighlighter language={language} style={atomOneDark}
                                                customStyle={{ borderRadius: '0.75rem', fontSize: '0.75rem', margin: 0, minHeight: '100%' }}
                                                showLineNumbers>
                                                {result.refactored_code || '// No refactored code provided.'}
                                            </SyntaxHighlighter>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Improvements Tab */}
                                {activeTab === 'improvements' && (
                                    <motion.div key="improvements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <ListChecks className="w-4 h-4 text-brand-400" /> Key Improvements Made
                                        </h4>
                                        {result.improvements.length === 0 ? (
                                            <p className="text-gray-500 text-sm italic">No specific improvements listed.</p>
                                        ) : (
                                            <ul className="space-y-3">
                                                {result.improvements.map((imp, i) => (
                                                    <motion.li key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.06 }}
                                                        className="flex items-start gap-3 glass rounded-xl p-4 border-white/5 hover:bg-white/5 transition-colors"
                                                    >
                                                        <span className="w-6 h-6 rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/20 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-sm">{i + 1}</span>
                                                        <span className="text-sm text-gray-200 leading-relaxed">{imp}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
