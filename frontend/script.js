// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════
const API_BASE = 'http://localhost:8000';

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════
let authToken = localStorage.getItem('cr_token') || null;
let currentUser = JSON.parse(localStorage.getItem('cr_user') || 'null');
let currentReviewData = null;

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    if (authToken && currentUser) {
        showApp();
    } else {
        showAuth();
    }
});

// ═══════════════════════════════════════════════════════════════
// AUTH HELPERS
// ═══════════════════════════════════════════════════════════════
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTabBtn = document.getElementById('loginTabBtn');
    const registerTabBtn = document.getElementById('registerTabBtn');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTabBtn.classList.add('tab-active');
        registerTabBtn.classList.remove('tab-active');
        loginTabBtn.classList.remove('text-gray-400');
        registerTabBtn.classList.add('text-gray-400');
    } else {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        registerTabBtn.classList.add('tab-active');
        loginTabBtn.classList.remove('tab-active');
        registerTabBtn.classList.remove('text-gray-400');
        loginTabBtn.classList.add('text-gray-400');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    const errDiv = document.getElementById('loginError');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
    errDiv.classList.add('hidden');

    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');

        saveSession(data);
        showApp();
    } catch (err) {
        errDiv.textContent = err.message;
        errDiv.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const btn = document.getElementById('registerBtn');
    const errDiv = document.getElementById('registerError');

    if (password.length < 6) {
        errDiv.textContent = 'Password must be at least 6 characters.';
        errDiv.classList.remove('hidden');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account...';
    errDiv.classList.add('hidden');

    try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed');

        saveSession(data);
        showApp();
    } catch (err) {
        errDiv.textContent = err.message;
        errDiv.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
    }
}

function saveSession(data) {
    authToken = data.access_token;
    currentUser = { username: data.username, email: data.email };
    localStorage.setItem('cr_token', authToken);
    localStorage.setItem('cr_user', JSON.stringify(currentUser));
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('cr_token');
    localStorage.removeItem('cr_user');
    showAuth();
}

// ═══════════════════════════════════════════════════════════════
// PAGE SWITCHING
// ═══════════════════════════════════════════════════════════════
function showAuth() {
    document.getElementById('authPage').classList.remove('hidden');
    document.getElementById('appPage').classList.add('hidden');
}

function showApp() {
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('appPage').classList.remove('hidden');

    // Set user info in sidebar
    if (currentUser) {
        document.getElementById('sidebarUsername').textContent = currentUser.username;
        document.getElementById('sidebarEmail').textContent = currentUser.email;
        document.getElementById('avatarInitial').textContent = currentUser.username.charAt(0).toUpperCase();
    }

    showSection('dashboard');
    loadDashboard();
}

function showSection(name) {
    const sections = ['dashboard', 'review', 'history'];
    sections.forEach(s => {
        document.getElementById(`section-${s}`).classList.add('hidden');
        const navBtn = document.getElementById(`nav-${s}`);
        if (navBtn) {
            navBtn.classList.remove('active', 'text-gray-300');
            navBtn.classList.add('text-gray-400');
        }
    });

    document.getElementById(`section-${name}`).classList.remove('hidden');
    const activeNav = document.getElementById(`nav-${name}`);
    if (activeNav) {
        activeNav.classList.add('active', 'text-gray-300');
        activeNav.classList.remove('text-gray-400');
    }

    const titles = {
        dashboard: ['Dashboard', 'Your code quality overview'],
        review: ['Code Review', 'Analyze and optimize your code with AI'],
        history: ['Review History', 'All your past code reviews']
    };
    document.getElementById('pageTitle').textContent = titles[name][0];
    document.getElementById('pageSubtitle').textContent = titles[name][1];

    if (name === 'history') loadHistory();
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
async function loadDashboard() {
    try {
        const [statsRes, reviewsRes] = await Promise.all([
            apiFetch('/api/stats'),
            apiFetch('/api/reviews?limit=5')
        ]);

        // Stats
        document.getElementById('statTotal').textContent = statsRes.total;
        document.getElementById('statAvgScore').textContent = statsRes.avg_score || '—';
        document.getElementById('statIssues').textContent = statsRes.total_issues;
        document.getElementById('statLangs').textContent = Object.keys(statsRes.languages || {}).length;

        // Recent reviews
        const list = document.getElementById('dashboardRecentList');
        if (reviewsRes.length === 0) {
            list.innerHTML = `<div class="text-center py-8 text-gray-500">
                <i class="fa-solid fa-inbox text-3xl mb-2 block text-gray-700"></i>
                No reviews yet. <button onclick="showSection('review')" class="text-brand-400 hover:underline">Start your first review!</button>
            </div>`;
        } else {
            list.innerHTML = reviewsRes.map(r => reviewHistoryCard(r)).join('');
        }
    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

// ═══════════════════════════════════════════════════════════════
// HISTORY
// ═══════════════════════════════════════════════════════════════
async function loadHistory() {
    const list = document.getElementById('historyList');
    list.innerHTML = `<div class="text-center py-8"><div class="loader-ring w-8 h-8 border-4 border-gray-700 rounded-full mx-auto"></div></div>`;

    try {
        const reviews = await apiFetch('/api/reviews');
        if (reviews.length === 0) {
            list.innerHTML = `<div class="text-center py-12 text-gray-500">
                <i class="fa-solid fa-clock-rotate-left text-4xl mb-3 block text-gray-700"></i>
                No history yet.
            </div>`;
        } else {
            list.innerHTML = reviews.map(r => reviewHistoryCard(r, true)).join('');
        }
    } catch (err) {
        list.innerHTML = `<div class="text-red-400 text-sm text-center py-4">Failed to load history.</div>`;
    }
}

function reviewHistoryCard(r, showDelete = false) {
    const score = r.score || 0;
    const scoreColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
    const langIcons = { python: '🐍', javascript: '🟨', java: '☕', cpp: '⚙️' };
    const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return `<div class="history-item flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors" onclick="loadReviewById(${r.id})">
        <div class="w-10 h-10 rounded-xl glass flex items-center justify-center text-lg flex-shrink-0">${langIcons[r.language] || '📄'}</div>
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-white capitalize">${r.language}</span>
                <span class="text-xs text-gray-600">•</span>
                <span class="text-xs text-gray-500">${date}</span>
            </div>
            <div class="flex items-center gap-3 mt-1">
                <span class="text-xs text-red-400">${r.critical_count} critical</span>
                <span class="text-xs text-orange-400">${r.high_count} high</span>
                <span class="text-xs text-yellow-400">${r.medium_count} medium</span>
            </div>
        </div>
        <div class="text-right flex-shrink-0">
            <span class="text-lg font-bold ${scoreColor}">${score}</span>
            <p class="text-xs text-gray-600">score</p>
        </div>
        ${showDelete ? `<button onclick="event.stopPropagation(); deleteReview(${r.id})" class="text-gray-600 hover:text-red-400 transition-colors ml-2"><i class="fa-solid fa-trash text-xs"></i></button>` : ''}
    </div>`;
}

async function loadReviewById(id) {
    showSection('review');
    showOutputLoading();

    try {
        const data = await apiFetch(`/api/reviews/${id}`);
        currentReviewData = data;
        document.getElementById('codeInput').value = data.original_code;
        document.getElementById('languageSelect').value = data.language;
        renderResults(data);
        switchResultTab('analysis');
    } catch (err) {
        hideOutputLoading();
        alert('Failed to load review.');
    }
}

async function deleteReview(id) {
    if (!confirm('Delete this review?')) return;
    try {
        await apiFetch(`/api/reviews/${id}`, 'DELETE');
        loadHistory();
        loadDashboard();
    } catch (err) {
        alert('Failed to delete review.');
    }
}

// ═══════════════════════════════════════════════════════════════
// CODE REVIEW
// ═══════════════════════════════════════════════════════════════
async function handleReview() {
    const code = document.getElementById('codeInput').value.trim();
    const language = document.getElementById('languageSelect').value;

    if (!code) {
        alert('Please paste some code to analyze.');
        return;
    }

    showOutputLoading();

    try {
        const data = await apiFetch('/api/review', 'POST', { code, language });
        currentReviewData = data;
        renderResults(data);
        switchResultTab('analysis');
        // Refresh dashboard stats silently
        loadDashboard();
    } catch (err) {
        hideOutputLoading();
        alert('Analysis failed: ' + err.message);
    }
}

function renderResults(data) {
    const summary = data.summary || {};
    const issues = data.issues || [];
    const score = summary.score || 0;

    // Score ring animation
    const ring = document.getElementById('scoreRing');
    const circumference = 251.2;
    const offset = circumference - (score / 100) * circumference;
    setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100);
    ring.style.stroke = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
    document.getElementById('scoreValue').textContent = score;

    // Overview
    document.getElementById('overviewText').textContent = summary.overview || 'Analysis complete.';
    document.getElementById('cntCritical').textContent = summary.critical || 0;
    document.getElementById('cntHigh').textContent = summary.high || 0;
    document.getElementById('cntMedium').textContent = summary.medium || 0;
    document.getElementById('cntLow').textContent = summary.low || 0;

    // Issues
    const issuesList = document.getElementById('issuesList');
    if (issues.length === 0) {
        issuesList.innerHTML = `<div class="text-center py-8 text-green-400"><i class="fa-solid fa-circle-check text-3xl mb-2 block"></i>No issues found! Excellent code.</div>`;
    } else {
        issuesList.innerHTML = issues.map(issue => `
            <div class="issue-card severity-${issue.severity.toLowerCase()} rounded-xl p-4 space-y-2">
                <div class="flex items-start justify-between gap-2">
                    <h4 class="text-sm font-semibold text-white flex items-center gap-2">
                        ${severityIcon(issue.severity)} ${escapeHtml(issue.title)}
                    </h4>
                    <div class="flex gap-1.5 flex-shrink-0">
                        <span class="text-xs px-2 py-0.5 rounded-full ${severityBadge(issue.severity)}">${issue.severity}</span>
                        <span class="text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400">${issue.category}</span>
                    </div>
                </div>
                ${issue.line_hint ? `<p class="text-xs text-gray-500"><i class="fa-solid fa-location-dot mr-1"></i>${escapeHtml(issue.line_hint)}</p>` : ''}
                <p class="text-xs text-gray-300 leading-relaxed">${escapeHtml(issue.description)}</p>
                ${issue.suggestion ? `
                <div class="mt-2">
                    <p class="text-xs text-gray-500 mb-1">Suggested fix:</p>
                    <pre class="rounded-lg overflow-x-auto"><code class="language-${document.getElementById('languageSelect').value} text-xs">${escapeHtml(issue.suggestion)}</code></pre>
                </div>` : ''}
            </div>
        `).join('');
    }

    // Refactored code
    const lang = document.getElementById('languageSelect').value;
    const refCode = document.getElementById('refactoredCode');
    refCode.textContent = data.refactored_code || '// No refactored code provided.';
    refCode.className = `language-${lang} text-xs`;

    // Improvements
    const improvements = data.improvements || [];
    const impList = document.getElementById('improvementsList');
    if (improvements.length === 0) {
        impList.innerHTML = `<li class="text-gray-500 text-sm">No specific improvements listed.</li>`;
    } else {
        impList.innerHTML = improvements.map((imp, i) => `
            <li class="flex items-start gap-3 glass rounded-xl p-3">
                <span class="w-6 h-6 rounded-full gradient-btn flex items-center justify-center text-xs font-bold text-white flex-shrink-0">${i + 1}</span>
                <span class="text-sm text-gray-300">${escapeHtml(imp)}</span>
            </li>
        `).join('');
    }

    // Highlight all code blocks
    hideOutputLoading();
    document.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
}

// ═══════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════
function switchResultTab(tab) {
    const tabs = ['analysis', 'refactored', 'improvements'];
    tabs.forEach(t => {
        document.getElementById(`output${capitalize(t)}`).classList.add('hidden');
        const btn = document.getElementById(`tab${capitalize(t)}`);
        btn.classList.remove('tab-active');
        btn.classList.add('text-gray-400');
    });
    document.getElementById(`output${capitalize(tab)}`).classList.remove('hidden');
    const activeBtn = document.getElementById(`tab${capitalize(tab)}`);
    activeBtn.classList.add('tab-active');
    activeBtn.classList.remove('text-gray-400');
}

function showOutputLoading() {
    document.getElementById('outputPlaceholder').classList.add('hidden');
    document.getElementById('outputAnalysis').classList.add('hidden');
    document.getElementById('outputRefactored').classList.add('hidden');
    document.getElementById('outputImprovements').classList.add('hidden');
    document.getElementById('outputLoading').classList.remove('hidden');
}

function hideOutputLoading() {
    document.getElementById('outputLoading').classList.add('hidden');
    document.getElementById('outputAnalysis').classList.remove('hidden');
}

function clearCode() {
    document.getElementById('codeInput').value = '';
    currentReviewData = null;
    document.getElementById('outputPlaceholder').classList.remove('hidden');
    document.getElementById('outputAnalysis').classList.add('hidden');
    document.getElementById('outputRefactored').classList.add('hidden');
    document.getElementById('outputImprovements').classList.add('hidden');
    document.getElementById('outputLoading').classList.add('hidden');
}

function copyRefactored() {
    const code = document.getElementById('refactoredCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        btn.classList.add('text-green-400');
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
            btn.classList.remove('text-green-400');
        }, 2000);
    });
}

function severityIcon(sev) {
    const icons = {
        critical: '<i class="fa-solid fa-triangle-exclamation text-red-400"></i>',
        high: '<i class="fa-solid fa-circle-exclamation text-orange-400"></i>',
        medium: '<i class="fa-solid fa-circle-exclamation text-yellow-400"></i>',
        low: '<i class="fa-solid fa-info-circle text-blue-400"></i>'
    };
    return icons[sev?.toLowerCase()] || '';
}

function severityBadge(sev) {
    const badges = {
        critical: 'bg-red-500/10 text-red-400 border border-red-500/20',
        high: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
        medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
        low: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
    };
    return badges[sev?.toLowerCase()] || 'bg-gray-700 text-gray-400';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// ═══════════════════════════════════════════════════════════════
// API FETCH WRAPPER
// ═══════════════════════════════════════════════════════════════
async function apiFetch(path, method = 'GET', body = null) {
    const opts = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        }
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, opts);

    if (res.status === 401) {
        handleLogout();
        throw new Error('Session expired. Please log in again.');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Request failed');
    return data;
}
