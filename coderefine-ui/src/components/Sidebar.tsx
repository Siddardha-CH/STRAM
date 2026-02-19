import React from 'react';
import { motion } from 'framer-motion';
import {
    Code2, LayoutDashboard, Search, History, LogOut, ArrowRightLeft
} from 'lucide-react';
import type { Section, User } from '../types';

interface SidebarProps {
    user: User | null;
    activeSection: Section;
    onNavigate: (s: Section) => void;
    onLogout: () => void;
}

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'review', label: 'Code Review', icon: <Search className="w-4 h-4" /> },
    { id: 'converter', label: 'Code Converter', icon: <ArrowRightLeft className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ user, activeSection, onNavigate, onLogout }) => {
    const initials = user?.username?.charAt(0).toUpperCase() ?? 'U';

    return (
        <aside className="w-64 glass-card flex-shrink-0 flex flex-col border-r border-white/5 fixed h-full z-40">
            {/* Logo */}
            <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center shadow-lg group">
                        <Code2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight gradient-text">CodeRefine</h1>
                        <p className="text-xs text-gray-400 font-medium">AI Code Platform</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`nav-link w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === item.id
                            ? 'bg-brand-500/10 text-brand-300 border-l-[3px] border-brand-500 shadow-[0_0_20px_-5px_rgba(124,58,237,0.3)]'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                            }`}
                    >
                        {item.icon}
                        {item.label}
                        {activeSection === item.id && (
                            <motion.div
                                layoutId="nav-indicator"
                                className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-400 shadow-[0_0_10px_currentColor]"
                            />
                        )}
                    </button>
                ))}

                {/* Language badges */}
                <div className="pt-4 pb-1">
                    <p className="text-xs text-brand-300 uppercase tracking-wider px-3 mb-2 font-semibold">Supported</p>
                    <div className="px-3 flex flex-wrap gap-1.5">
                        {[
                            { name: 'Python', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                            { name: 'JS', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
                            { name: 'Java', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
                            { name: 'C++', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                            { name: 'C', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
                            { name: 'HTML', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
                            { name: 'CSS', color: 'bg-blue-600/10 text-blue-500 border-blue-600/20' },
                        ].map(lang => (
                            <span key={lang.name} className={`text-[10px] font-mono border rounded px-2 py-0.5 ${lang.color} backdrop-blur-sm`}>{lang.name}</span>
                        ))}
                    </div>
                </div>


            </nav>

            {/* User */}
            <div className="p-3 border-t border-white/5">
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button onClick={onLogout} className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10" title="Logout">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
};
