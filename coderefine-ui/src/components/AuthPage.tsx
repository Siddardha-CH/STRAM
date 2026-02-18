import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api';
import type { AuthResponse } from '../types';
import toast from 'react-hot-toast';

interface AuthPageProps {
    onAuth: (data: AuthResponse) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {
    const [tab, setTab] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register state
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await authApi.login(loginEmail, loginPassword);
            toast.success(`Welcome back, ${data.username}!`);
            onAuth(data);
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (regPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            const data = await authApi.register(regUsername, regEmail, regPassword);
            toast.success(`Account created! Welcome, ${data.username}!`);
            onAuth(data);
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-950 bg-grid-pattern flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="glass-card rounded-2xl p-8 w-full max-w-md glow-brand relative z-10"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-btn mb-4 shadow-lg"
                    >
                        <Code2 className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold gradient-text">CodeRefine</h1>
                    <p className="text-gray-400 mt-1 text-sm">AI-Powered Code Review Platform</p>
                </div>

                {/* Tabs */}
                <div className="flex glass rounded-xl p-1 mb-6 gap-1">
                    {(['login', 'register'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${tab === t ? 'bg-brand-500/20 text-brand-400 shadow-sm' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            {t === 'login' ? 'Sign In' : 'Register'}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {tab === 'login' ? (
                        <motion.form
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleLogin}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="input-field w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input type={showPass ? 'text' : 'password'} required value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="input-field w-full pl-10 pr-10 py-2.5 rounded-xl text-sm" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="gradient-btn w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full loader-spin" /> : <><ArrowRight className="w-4 h-4" /> Sign In</>}
                            </button>
                            <p className="text-center text-xs text-gray-600 mt-2">
                                Demo: <span className="text-gray-400">test@demo.com / password123</span>
                            </p>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="register"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleRegister}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input type="text" required value={regUsername} onChange={e => setRegUsername(e.target.value)}
                                        placeholder="johndoe"
                                        className="input-field w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="input-field w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input type={showPass ? 'text' : 'password'} required value={regPassword} onChange={e => setRegPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        className="input-field w-full pl-10 pr-10 py-2.5 rounded-xl text-sm" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="gradient-btn w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full loader-spin" /> : <><Sparkles className="w-4 h-4" /> Create Account</>}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
