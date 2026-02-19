import { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CodeReview } from './components/CodeReview';
import { CodeConverter } from './components/CodeConverter';
import { History } from './components/History';
import { reviewApi } from './api';
import type { AuthResponse, Section, ReviewResult, User } from './types';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('cr_token'));
  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem('cr_user');
    return u ? JSON.parse(u) : null;
  });
  const [section, setSection] = useState<Section>('dashboard');

  // For loading a review into the CodeReview panel
  const [reviewCode, setReviewCode] = useState('');
  const [reviewLanguage, setReviewLanguage] = useState('python');
  const [reviewResult, setReviewResult] = useState<ReviewResult | undefined>(undefined);

  const handleAuth = (data: AuthResponse) => {
    localStorage.setItem('cr_token', data.access_token);
    const u = { id: 0, username: data.username, email: data.email, created_at: '', review_count: 0 };
    localStorage.setItem('cr_user', JSON.stringify(u));
    setToken(data.access_token);
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('cr_token');
    localStorage.removeItem('cr_user');
    setToken(null);
    setUser(null);
  };

  const handleLoadReview = useCallback(async (id: number) => {
    try {
      const data = await reviewApi.get(id);
      setReviewCode(data.original_code);
      setReviewLanguage(data.language);
      setReviewResult(data as ReviewResult);
      setSection('review');
    } catch {
      // silently fail
    }
  }, []);

  const handleNavigate = (s: Section) => {
    setSection(s);
    if (s === 'review') {
      // Reset review panel when navigating fresh
      setReviewCode('');
      setReviewResult(undefined);
    }
  };

  const PAGE_TITLES: Record<Section, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Your code quality overview' },
    review: { title: 'Code Review', subtitle: 'Analyze and optimize your code with AI' },
    converter: { title: 'Code Converter', subtitle: 'Translate and optimize code complexity' },
    history: { title: 'Review History', subtitle: 'All your past code reviews' },
  };

  if (!token) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1e1e2e', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.2)' } }} />
        <AuthPage onAuth={handleAuth} />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e1e2e', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.2)' } }} />
      <div className="flex min-h-screen">
        <Sidebar user={user} activeSection={section} onNavigate={handleNavigate} onLogout={handleLogout} />

        {/* Main content */}
        <main className="flex-1 ml-64 flex flex-col min-h-screen">
          {/* Header */}
          <header className="glass-card border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
            <div>
              <h2 className="text-lg font-bold text-white">{PAGE_TITLES[section].title}</h2>
              <p className="text-xs text-gray-500">{PAGE_TITLES[section].subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass rounded-xl px-3 py-1.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-gray-400">API Connected</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {section === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Dashboard onNavigate={handleNavigate} onLoadReview={handleLoadReview} />
                </motion.div>
              )}
              {section === 'review' && (
                <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <CodeReview initialCode={reviewCode} initialLanguage={reviewLanguage} initialResult={reviewResult} />
                </motion.div>
              )}
              {section === 'converter' && (
                <motion.div key="converter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <CodeConverter />
                </motion.div>
              )}
              {section === 'history' && (
                <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <History onLoadReview={handleLoadReview} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
