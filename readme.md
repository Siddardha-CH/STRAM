# 🔍 CodeRefine — AI-Powered Code Review & Converter Platform

<div align="center">

![CodeRefine Banner](https://img.shields.io/badge/CodeRefine-AI%20Code%20Platform-7c3aed?style=for-the-badge&logo=code&logoColor=white)

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Groq](https://img.shields.io/badge/LLM-Groq%20%7C%20LLaMA--3.3--70B-orange?style=flat-square&logo=meta&logoColor=white)](https://groq.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

**Submit any code. Get AI-powered reviews, refactors, and language conversions in seconds.**

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [One-Click Launch (Windows)](#-one-click-launch-windows)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Supported Languages](#-supported-languages)
- [How It Works](#-how-it-works)
- [Demo Account](#-demo-account)
- [Screenshots](#-screenshots)

---

## 🧠 About

**CodeRefine** is a full-stack AI-powered developer tool that performs deep code analysis using **LLaMA-3.3-70B** via the **Groq API**. It provides:

- 🔴 **Severity-graded issue detection** (Critical / High / Medium / Low)
- ♻️ **AI-refactored code** — a complete rewrite following best practices
- 🔁 **Code Converter** — translate code between 8+ languages with Big-O complexity analysis
- 📊 **Personal Dashboard** — per-user statistics and review history
- 🔐 **JWT Authentication** — secure account registration and login

Built for a hackathon, CodeRefine demonstrates how LLMs can be applied to practical developer tooling beyond chat interfaces.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **AI Code Review** | Submit code and receive a quality score (0–100), categorized issues with line hints, and a fully refactored version |
| 🔁 **Code Converter** | Paste code, select a target language, get converted + optimized code with time & space complexity before/after |
| 📊 **Dashboard** | Stats cards (total reviews, average score, total issues, languages used) with animated progress bars |
| 🕐 **Review History** | Browse all past reviews with one-click reload into the review panel |
| 🔐 **Auth System** | Register/login with email+password. JWT tokens persisted in localStorage. 24-hour expiry. |
| 🌙 **Dark UI** | Glassmorphism design with Framer Motion animations, Tailwind v4, and `react-syntax-highlighter` |
| 🚀 **Groq-Powered** | Uses Groq's inference API with `llama-3.3-70b-versatile` for near-instant LLM responses |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (React SPA)                   │
│  ┌──────────┐  ┌────────────┐  ┌───────────┐  ┌─────────┐  │
│  │Dashboard │  │ CodeReview │  │CodeConvert│  │ History │  │
│  └──────────┘  └────────────┘  └───────────┘  └─────────┘  │
│           ↕  Axios (proxied via Vite /api → :8000)          │
└─────────────────────────────────────────────────────────────┘
                            │
                     HTTP REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (:8000)                    │
│                                                             │
│   ┌───────────┐   ┌────────────┐   ┌──────────────────┐    │
│   │  /api/auth │   │ /api/review │   │   /api/convert   │    │
│   │ register  │   │  (POST)    │   │    (POST)        │    │
│   │  login    │   │ /api/reviews│   │                  │    │
│   │   me      │   │  (GET/DEL) │   └──────────────────┘    │
│   └───────────┘   └────────────┘                           │
│          │               │                                  │
│   ┌─────────────────────────────────────────┐              │
│   │         SQLAlchemy ORM + SQLite          │              │
│   │     (users table + reviews table)        │              │
│   └─────────────────────────────────────────┘              │
│                         │                                   │
│   ┌─────────────────────────────────────────┐              │
│   │          AI Service (ai_service.py)       │              │
│   │    Groq Client → llama-3.3-70b-versatile │              │
│   │    → Structured JSON response (review)   │              │
│   │    → Structured JSON response (convert)  │              │
│   └─────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

**Flow:**
1. User authenticates → receives a JWT Bearer token
2. Token is attached to every subsequent request via Axios interceptor
3. Code submission hits `/api/review` or `/api/convert`
4. Backend calls Groq API with a structured prompt requesting JSON output
5. Response is parsed, stored in SQLite (for reviews), and returned
6. Frontend renders issues, refactored code, score badge, and complexity analysis

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.10+ | Runtime |
| **FastAPI** | 0.115 | REST API framework |
| **Uvicorn** | 0.30 | ASGI server |
| **SQLAlchemy** | 2.0 | ORM |
| **SQLite** | — | Database (file: `coderefine.db`) |
| **Groq SDK** | 0.13 | LLM inference client |
| **LLaMA 3.3 70B** | — | Core AI model (via Groq) |
| **python-jose** | 3.3 | JWT creation & validation |
| **passlib / pbkdf2_hmac** | — | Password hashing (PBKDF2-SHA256, 100k iterations) |
| **python-dotenv** | 1.0 | Environment variable loading |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI framework |
| **TypeScript** | 5.9 | Type safety |
| **Vite** | 7.x | Build tool & dev server |
| **TailwindCSS** | 4.x | Utility-first styling |
| **Framer Motion** | 12.x | Animations & page transitions |
| **Axios** | 1.x | HTTP client with interceptors |
| **react-syntax-highlighter** | 16.x | Code display with syntax highlighting |
| **react-hot-toast** | 2.x | Toast notifications |
| **Lucide React** | 0.574 | Icon library |

---

## 📁 Project Structure

```
STRAM/
├── backend/                    # FastAPI backend
│   ├── main.py                 # All API routes (auth, review, convert, stats)
│   ├── models.py               # SQLAlchemy ORM models (User, Review)
│   ├── database.py             # DB engine, session factory, Base
│   ├── auth.py                 # JWT creation, PBKDF2 password hashing, OAuth2
│   ├── ai_service.py           # Groq API calls for review + conversion
│   ├── seed_db.py              # Creates a demo account (test@demo.com)
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # 🔑 API keys (not committed)
│   └── coderefine.db           # SQLite database (auto-created)
│
├── coderefine-ui/              # React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── App.tsx             # Root: auth gate, section routing, state
│   │   ├── api.ts              # Typed Axios wrappers (authApi, reviewApi, converterApi)
│   │   ├── types.ts            # Shared TypeScript interfaces
│   │   ├── index.css           # Tailwind + custom glassmorphism tokens
│   │   └── components/
│   │       ├── AuthPage.tsx    # Login / Register form with toggle
│   │       ├── Sidebar.tsx     # Navigation, language badges, user info
│   │       ├── Dashboard.tsx   # Stats cards + recent reviews + language chart
│   │       ├── CodeReview.tsx  # Code editor, AI analysis panel, tabs
│   │       ├── CodeConverter.tsx # Split-pane converter with complexity footer
│   │       └── History.tsx     # Paginated review list with delete
│   ├── vite.config.ts          # Vite dev server + /api proxy to :8000
│   └── package.json
│
├── frontend/                   # Standalone HTML/JS prototype (legacy)
│   ├── index.html
│   └── script.js
│
├── start_app.ps1               # Windows launcher script (opens 2 PowerShell windows)
├── reproduce_analysis.py       # Debug script: reproduce a code review call
├── reproduce_auth.py           # Debug script: test auth endpoints
├── test_c_submission.py        # Test: submit C code for review
├── test_html_css_submission.py # Test: submit HTML/CSS code for review
└── readme.md                   # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** — `python --version`
- **Node.js 18+** — `node --version`
- **Groq API Key** — Get one free at [console.groq.com](https://console.groq.com)

---

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env   # or create manually (see below)

# (Optional) Seed a demo user
python seed_db.py

# Start the API server
uvicorn main:app --reload --port 8000
```

The API will be live at: **http://localhost:8000**
Interactive docs at: **http://localhost:8000/docs**

---

### 2. Frontend Setup

```bash
# Navigate to frontend
cd coderefine-ui

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be live at: **http://localhost:5173**

> **Proxy**: The Vite dev server proxies `/api/*` → `http://localhost:8000` automatically (see `vite.config.ts`). No CORS issues during development.

---

### ⚡ One-Click Launch (Windows)

From the project root, run:

```powershell
.\start_app.ps1
```

This opens two PowerShell windows — one for the backend (port 8000), one for the frontend (port 5173).

> **Note:** Update the paths inside `start_app.ps1` to match your local directory before running.

---

## 📡 API Reference

> Base URL: `http://localhost:8000`
> Authentication: `Authorization: Bearer <token>` (required for all `/api/review*`, `/api/stats`, `/api/convert` endpoints)

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{username, email, password}` | Register a new user, returns JWT |
| `POST` | `/api/auth/login` | `{email, password}` | Login, returns JWT |
| `GET` | `/api/auth/me` | — | Get current user info + review count |

### Code Review

| Method | Endpoint | Body / Params | Description |
|---|---|---|---|
| `POST` | `/api/review` | `{code, language}` | Submit code for AI review. Saves to DB. |
| `GET` | `/api/reviews` | `?limit=20` | List all reviews for current user |
| `GET` | `/api/reviews/{id}` | — | Get full review by ID |
| `DELETE` | `/api/reviews/{id}` | — | Delete a review |
| `GET` | `/api/stats` | — | Get aggregate stats (total, avg_score, issues, languages) |

### Code Converter

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/convert` | `{code, target_language}` | Convert code to target language + complexity analysis |

### Example: Submit a Review

```bash
curl -X POST http://localhost:8000/api/review \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def add(a, b): return a + b",
    "language": "python"
  }'
```

**Response:**
```json
{
  "review_id": 42,
  "summary": {
    "score": 85,
    "critical": 0,
    "high": 0,
    "medium": 1,
    "low": 2,
    "overview": "Simple, clean function. Missing type hints and docstring."
  },
  "issues": [
    {
      "severity": "medium",
      "category": "Best Practice",
      "title": "Missing type annotations",
      "line_hint": "def add(a, b)",
      "description": "Python 3 supports type hints which improve readability.",
      "suggestion": "def add(a: int | float, b: int | float) -> int | float:"
    }
  ],
  "refactored_code": "def add(a: int | float, b: int | float) -> int | float:\n    \"\"\"Return the sum of a and b.\"\"\"\n    return a + b",
  "improvements": ["Add type hints", "Add docstring", "Consider unit tests"]
}
```

---

## 🔧 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Required
GROQ_API_KEY=gsk_your_groq_api_key_here

# Optional (defaults shown)
SECRET_KEY=your_jwt_secret_key_here_change_in_production
DATABASE_URL=sqlite:///./coderefine.db
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | — | Your Groq API key from console.groq.com |
| `SECRET_KEY` | ⚠️ Recommended | `fallback_secret_key` | JWT signing secret. **Change in production.** |
| `DATABASE_URL` | ❌ No | `sqlite:///./coderefine.db` | SQLAlchemy-compatible DB URL |

---

## 🗄️ Database Schema

The SQLite database (`coderefine.db`) is created automatically on first run.

### `users` Table
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PK | Auto-increment user ID |
| `username` | VARCHAR(50) | Unique username |
| `email` | VARCHAR(100) | Unique email address |
| `hashed_password` | VARCHAR(255) | PBKDF2-SHA256 hashed (salt + key) |
| `created_at` | DATETIME | Account creation timestamp |

### `reviews` Table
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PK | Auto-increment review ID |
| `user_id` | INTEGER FK → users | Owner of the review |
| `language` | VARCHAR(20) | Submitted language |
| `original_code` | TEXT | The raw submitted code |
| `refactored_code` | TEXT | AI-generated refactor |
| `score` | FLOAT | Quality score (0–100) |
| `critical_count` | INTEGER | Critical issues count |
| `high_count` | INTEGER | High severity issues count |
| `medium_count` | INTEGER | Medium severity issues count |
| `low_count` | INTEGER | Low severity issues count |
| `issues_json` | TEXT | JSON array of all issue objects |
| `created_at` | DATETIME | Review timestamp |

---

## 🌐 Supported Languages

| Review | Convert |
|---|---|
| Python 🐍 | Python |
| JavaScript 🟨 | JavaScript |
| Java ☕ | TypeScript |
| C++ ⚙️ | Java |
| C | C++ |
| HTML | C |
| CSS | Go |
| — | Rust |

---

## ⚙️ How It Works

### Code Review Pipeline

```
User submits code
      │
      ▼
POST /api/review
      │
      ▼
ai_service.get_code_review(code, language)
      │
      ▼ Groq API (llama-3.3-70b-versatile)
      │ System: "You are a senior engineer. Return STRICT JSON with
      │          summary, issues[], refactored_code, improvements[]"
      │ Temperature: 0.1 (deterministic)
      │ response_format: json_object
      │
      ▼ Parsed JSON
      │
      ▼
Save Review to SQLite (score, counts, issues_json, refactored_code)
      │
      ▼
Return to frontend → render score badge, issue cards, diff view
```

### Code Converter Pipeline

```
User pastes code + selects target language
      │
      ▼
POST /api/convert
      │
      ▼
ai_service.convert_code(code, target_language)
      │
      ▼ Groq API
      │ Returns: { converted_code, complexity_analysis, explanation }
      │
      ▼
Frontend renders side-by-side with complexity before/after
```

### Authentication Flow

```
Register/Login
      │
      ▼
PBKDF2-SHA256 hash (100,000 iterations, random salt)
      │
      ▼
JWT token signed with SECRET_KEY (HS256, 24h expiry)
      │
      ▼
Stored in localStorage as 'cr_token'
      │
      ▼
Axios interceptor: Authorization: Bearer <token> on every request
```

---

## 🧪 Demo Account

A seeded demo account is available after running `python seed_db.py`:

| Field | Value |
|---|---|
| Email | `test@demo.com` |
| Password | `password123` |

---

## 🔬 Test Scripts

The repo includes helper scripts for testing the backend directly:

```bash
# Test the auth flow
python reproduce_auth.py

# Test a full code review analysis
python reproduce_analysis.py

# Test C code submission
python test_c_submission.py

# Test HTML/CSS submission
python test_html_css_submission.py
```

---

## 🎨 UI Highlights

- **Glassmorphism design** — translucent card surfaces with backdrop blur
- **Framer Motion** — smooth `AnimatePresence` page transitions, staggered stat cards
- **Syntax Highlighting** — `react-syntax-highlighter` with `atomOneDark` theme
- **Severity color coding** — 🔴 Critical / 🟠 High / 🟡 Medium / ⚪ Low
- **Score badge** — green (≥80), yellow (≥60), red (<60)
- **Real-time loader** — spinner overlay with "Analyzing Complexity..." text during AI calls

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a PR

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

Built with ❤️ using **FastAPI** + **React** + **Groq LLaMA-3.3-70B**

</div>
