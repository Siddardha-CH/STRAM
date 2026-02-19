import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Wand2, Trash2, Copy, Check, ChevronDown, AlertTriangle, AlertCircle, Info, CheckCircle2, ListChecks, Code2, Upload, RefreshCw } from 'lucide-react';
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
    { value: 'c', label: 'C', icon: '🔵' },
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'css', label: 'CSS', icon: '🎨' },
];

const SeverityIcon: React.FC<{ severity: string }> = ({ severity }) => {
    const s = severity.toLowerCase();
    if (s === 'critical') return <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />;
    if (s === 'high') return <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />;
    if (s === 'medium') return <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />;
    return <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />;
};

const severityBadge = (s: string) => {
    const m: Record<string, string> = {
        critical: 'bg-red-500/10 text-red-400 border border-red-500/20',
        high: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
        medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
        low: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    };
    return m[s.toLowerCase()] ?? 'bg-gray-700 text-gray-400';
};

const IssueCard: React.FC<{ issue: Issue; language: string; index: number }> = ({ issue, language, index }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`severity-${issue.severity.toLowerCase()} rounded-xl overflow-hidden`}
        >
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/5 transition-colors">
                <SeverityIcon severity={issue.severity} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{issue.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${severityBadge(issue.severity)}`}>{issue.severity}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400">{issue.category}</span>
                    </div>
                    {issue.line_hint && <p className="text-xs text-gray-500 mt-0.5">📍 {issue.line_hint}</p>}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3">
                            <p className="text-sm text-gray-300 leading-relaxed">{issue.description}</p>
                            {issue.suggestion && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1.5 font-medium">Suggested Fix:</p>
                                    <SyntaxHighlighter language={language} style={atomOneDark}
                                        customStyle={{ borderRadius: '0.5rem', fontSize: '0.75rem', margin: 0 }}>
                                        {issue.suggestion}
                                    </SyntaxHighlighter>
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
    const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';

    return (
        <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="40" fill="none" stroke="#1e1e2e" strokeWidth="8" />
                <motion.circle
                    cx="45" cy="45" r="40" fill="none" stroke={color} strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{ strokeDasharray: circumference }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-2xl font-bold text-white"
                >{score}</motion.span>
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
                else if (['cpp', 'cc', 'hpp', 'c', 'h'].includes(ext)) {
                    if (['c', 'h'].includes(ext)) setLanguage('c');
                    else setLanguage('cpp');
                }
                else if (['html', 'htm'].includes(ext)) setLanguage('html');
                else if (['css'].includes(ext)) setLanguage('css');
            }
        };
        reader.readAsText(file);
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
                <div className="glass-card rounded-2xl p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <Code2 className="w-4 h-4 text-brand-400" /> Source Code
                        </h3>
                        <div className="relative">
                            <select value={language} onChange={e => setLanguage(e.target.value as Language)}
                                className="input-field text-xs rounded-lg px-3 py-1.5 pr-7 appearance-none cursor-pointer">
                                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.icon} {l.label}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                    <textarea
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        className="flex-1 bg-surface-950 border border-gray-800 rounded-xl p-4 font-mono text-sm text-gray-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none transition-colors placeholder-gray-700 min-h-[480px]"
                        placeholder={`// Paste your ${language} code here...\n\nfunction example() {\n    // Let the AI find the issues!\n}`}
                        spellCheck={false}
                    />
                    <div className="flex gap-3 mt-4">
                        <button onClick={() => { setCode(''); setResult(null); }}
                            className="glass px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Clear
                        </button>


                        <label className="glass px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer">
                            <Upload className="w-4 h-4" /> Upload
                            <input type="file" className="hidden" onChange={handleFileUpload} accept=".py,.js,.jsx,.ts,.tsx,.java,.cpp,.cc,.c,.h" />
                        </label>


                        <button onClick={handleReview} disabled={loading}
                            className="gradient-btn flex-1 py-2.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
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
                                    <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 space-y-4">
                                        {/* Score + Summary */}
                                        <div className="glass rounded-2xl p-4 flex items-center gap-4">
                                            <ScoreRing score={result.summary.score} />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-300 leading-relaxed">{result.summary.overview}</p>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {[
                                                        { label: 'Critical', count: result.summary.critical, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
                                                        { label: 'High', count: result.summary.high, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
                                                        { label: 'Medium', count: result.summary.medium, color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
                                                        { label: 'Low', count: result.summary.low, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                                                    ].map(s => (
                                                        <span key={s.label} className={`text-xs px-2.5 py-1 rounded-full border ${s.color}`}>
                                                            {s.count} {s.label}
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
                                        <h4 className="text-sm font-semibold text-gray-300 mb-4">Key Improvements Made</h4>
                                        {result.improvements.length === 0 ? (
                                            <p className="text-gray-500 text-sm">No specific improvements listed.</p>
                                        ) : (
                                            <ul className="space-y-3">
                                                {result.improvements.map((imp, i) => (
                                                    <motion.li key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.06 }}
                                                        className="flex items-start gap-3 glass rounded-xl p-3.5"
                                                    >
                                                        <span className="w-6 h-6 rounded-full gradient-btn flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">{i + 1}</span>
                                                        <span className="text-sm text-gray-300 leading-relaxed">{imp}</span>
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
