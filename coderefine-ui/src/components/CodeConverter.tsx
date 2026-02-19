import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Sparkles, Copy, Check, Info, Clock, Database, ArrowRight } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { converterApi } from '../api';
import type { ConversionResult } from '../types';
import toast from 'react-hot-toast';

const LANGUAGES: { value: string; label: string }[] = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'typescript', label: 'TypeScript' },
];

export const CodeConverter: React.FC = () => {
    const [sourceCode, setSourceCode] = useState('');
    const [targetLang, setTargetLang] = useState('javascript');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ConversionResult | null>(null);
    const [copied, setCopied] = useState(false);

    const handleConvert = async () => {
        if (!sourceCode.trim()) {
            toast.error('Please enter some code to convert');
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            const data = await converterApi.convert(sourceCode, targetLang);
            setResult(data);
            toast.success('Conversion complete!');
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Conversion failed');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!result?.converted_code) return;
        navigator.clipboard.writeText(result.converted_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ArrowRightLeft className="w-6 h-6 text-brand-400" /> Code Converter
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Translate and optimize code between languages</p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">Target Language:</span>
                    <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="bg-surface-800 border border-white/10 text-white text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5"
                    >
                        {LANGUAGES.map(l => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
                {/* Input Panel */}
                <div className="glass-card rounded-2xl flex flex-col overflow-hidden border-white/5 shadow-2xl shadow-black/20">
                    <div className="p-3 border-b border-white/5 bg-surface-900/50 flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-2">Source Code</span>
                    </div>
                    <textarea
                        value={sourceCode}
                        onChange={(e) => setSourceCode(e.target.value)}
                        placeholder="Paste your code here..."
                        className="flex-1 w-full bg-transparent p-4 text-sm font-mono text-gray-300 focus:outline-none resize-none"
                        spellCheck={false}
                    />
                    <div className="p-4 border-t border-white/5 bg-surface-900/30">
                        <button
                            onClick={handleConvert}
                            disabled={loading || !sourceCode.trim()}
                            className="gradient-btn w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full loader-spin" />
                                    <span>Converting & Optimizing...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" /> Convert to {LANGUAGES.find(l => l.value === targetLang)?.label}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Panel */}
                <div className="glass-card rounded-2xl flex flex-col overflow-hidden border-white/5 shadow-2xl shadow-black/20 relative">
                    <div className="p-3 border-b border-white/5 bg-surface-900/50 flex justify-between items-center">
                        <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider pl-2">
                            Converted Output
                        </span>
                        {result && (
                            <button
                                onClick={copyToClipboard}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                title="Copy code"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 relative bg-[#282c34] overflow-hidden">
                        {loading && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-900/80 backdrop-blur-sm">
                                <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full loader-spin mb-4" />
                                <p className="text-brand-200 animate-pulse font-medium">Analyzing Complexity...</p>
                            </div>
                        )}

                        {!result ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 p-8 text-center">
                                <ArrowRight className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-sm">Converted syntax and optimization analysis will appear here.</p>
                            </div>
                        ) : (
                            <div className="h-full overflow-auto custom-scrollbar">
                                <SyntaxHighlighter
                                    language={targetLang}
                                    style={atomOneDark}
                                    customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '14px' }}
                                    showLineNumbers={true}
                                >
                                    {result.converted_code}
                                </SyntaxHighlighter>
                            </div>
                        )}
                    </div>

                    {/* Complexity Analysis Footer */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border-t border-white/10 bg-surface-900/80 backdrop-blur-md p-4"
                            >
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div className="bg-surface-800/50 rounded-lg p-3 border border-white/5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="text-xs font-semibold text-gray-400 uppercase">Time Complexity</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 line-through decoration-red-500/50">{result.complexity_analysis.original_time}</span>
                                            <ArrowRight className="w-3 h-3 text-gray-600" />
                                            <span className="text-green-400 font-bold">{result.complexity_analysis.new_time}</span>
                                        </div>
                                    </div>
                                    <div className="bg-surface-800/50 rounded-lg p-3 border border-white/5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Database className="w-3.5 h-3.5 text-purple-400" />
                                            <span className="text-xs font-semibold text-gray-400 uppercase">Space Complexity</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 line-through decoration-red-500/50">{result.complexity_analysis.original_space}</span>
                                            <ArrowRight className="w-3 h-3 text-gray-600" />
                                            <span className="text-green-400 font-bold">{result.complexity_analysis.new_space}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 bg-brand-900/20 p-3 rounded-lg border border-brand-500/10 flex gap-2">
                                    <Info className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                                    <p>{result.explanation}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
