# CodeRefine — AI Code Review Platform

> Submit code, get an AI-powered quality score, severity-bucketed vulnerabilities, a full refactor, and a language converter — all in seconds.

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-6DB33F?style=flat&logo=spring)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791?style=flat&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)
![Groq AI](https://img.shields.io/badge/Groq-Llama%203.3%2070B-F55036?style=flat)

---

## Features

| Feature | Detail |
|---|---|
| **AI Code Review** | Quality score 0–100 + Critical / High / Medium / Low issue breakdown |
| **Full Refactor** | Llama 3.3 70B rewrites your code with explanations |
| **Code Converter** | Translate between Java, Python, JS, C++, Go, Rust, TypeScript |
| **Review History** | Paginated list, per-review stats, delete |
| **Stats Dashboard** | Total reviews, average score, total issues, language distribution |
| **JWT Auth** | Register/login with BCrypt-hashed passwords, stateless JWT sessions |

---

## Tech Stack

**Backend** — Spring Boot 3.3.5 · Spring Security · JPA/Hibernate · PostgreSQL · jjwt 0.12.6 · Groq API (Llama 3.3 70B)
**Frontend** — React 18 · TypeScript · Tailwind CSS · Vite · Framer Motion · Zustand

---

## Project Structure

```
STRAM/
├── stram-backend/          # Spring Boot REST API (port 8000)
│   └── src/main/java/com/coderefine/
│       ├── controller/     # AuthController, ReviewController, ConverterController
│       ├── service/        # AiService (Groq), JwtService
│       ├── model/          # User, Review (JPA entities)
│       ├── repository/     # UserRepository, ReviewRepository
│       └── config/         # SecurityConfig, JwtAuthFilter
└── src/                    # React frontend (port 5173)
    └── components/
        ├── CodeEditor/
        ├── ReviewPanel/
        └── ConverterPanel/
```

---

## Getting Started

### Prerequisites
- Java 21+, Maven 3.9+
- Node.js 18+, npm
- PostgreSQL 14+ running on port 5432
- Groq API key (free at https://console.groq.com)

### 1. Database Setup

```sql
CREATE DATABASE coderefine;
```

### 2. Backend

```bash
cd stram-backend
export GROQ_API_KEY=your_key_here
mvn spring-boot:run
# API starts at http://localhost:8000
```

**application.properties defaults:**
```
spring.datasource.url=jdbc:postgresql://localhost:5432/coderefine
spring.datasource.username=postgres
server.port=8000
app.groq.model=llama-3.3-70b-versatile
```

### 3. Frontend

```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## API Reference

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{username, email, password}` | Register new user |
| POST | `/api/auth/login` | `{username, password}` | Login, returns JWT |
| GET | `/api/auth/me` | — | Current user + review count |

### Code Review

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/review` | AI review + save (`{code, language}`) |
| GET | `/api/reviews` | Paginated history (`?limit=10`) |
| GET | `/api/reviews/{id}` | Single review detail |
| DELETE | `/api/reviews/{id}` | Delete review |
| GET | `/api/stats` | Aggregate stats |

### Code Conversion

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/convert` | Convert language (`{code, targetLanguage}`) |

All protected endpoints require `Authorization: Bearer <token>`.

---

## AI Response Structure

```json
{
  "review_id": 42,
  "score": 78,
  "summary": "Code is functional but has security concerns...",
  "issues": [
    { "severity": "HIGH", "line": 14, "description": "SQL injection risk", "suggestion": "Use prepared statements" }
  ],
  "refactored_code": "...",
  "improvements": ["Add input validation", "Extract magic numbers to constants"]
}
```

---

## License

MIT
