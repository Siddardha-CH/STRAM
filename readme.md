# CodeRefine — AI Code Review Platform

> AI-powered code analysis with quality scoring, vulnerability detection, and automated refactoring.

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-6DB33F?logo=springboot)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-FF6B6B)

## What It Does

Users paste or upload code and receive an instant AI-powered review:

- **Quality Score** (0–100) with animated ring visualization
- **Issue Breakdown** bucketed by severity — Critical / High / Medium / Low
- **Refactored Code** — complete rewrite of the submission
- **Code Converter** — translate between 7 languages with complexity analysis
- **Review History** — all past submissions, searchable and re-loadable

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.3, Spring Security, JPA/Hibernate |
| Auth | JWT (jjwt 0.12), BCrypt |
| Database | PostgreSQL 16 |
| AI | Groq API — Llama 3.3 70B Versatile |
| Frontend | React 18, TypeScript, Tailwind CSS, Framer Motion |
| Build | Maven, Vite |

## Project Structure

```
STRAM/
├── stram-backend/          # Spring Boot backend (Java 21)
│   ├── src/main/java/com/coderefine/
│   │   ├── controller/     # AuthController, ReviewController, ConverterController
│   │   ├── service/        # JwtService, AiService
│   │   ├── model/          # User, Review (JPA entities)
│   │   ├── repository/     # UserRepository, ReviewRepository
│   │   ├── config/         # SecurityConfig, JwtAuthFilter
│   │   └── dto/            # Request/response DTOs
│   └── src/main/resources/
│       └── application.properties
└── coderefine-ui/          # React frontend (Vite + TypeScript)
    └── src/
        ├── components/     # CodeReview, Dashboard, History, Sidebar
        └── api.ts          # Axios API client
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Current user info |
| POST | `/api/review` | JWT | Submit code for AI review |
| GET | `/api/reviews` | JWT | Review history (paginated) |
| GET | `/api/reviews/{id}` | JWT | Single review detail |
| DELETE | `/api/reviews/{id}` | JWT | Delete a review |
| GET | `/api/stats` | JWT | Aggregate statistics |
| POST | `/api/convert` | JWT | Convert code to another language |

## Running Locally

### Prerequisites
- Java 21+, Maven 3.9+
- PostgreSQL 16 running on `localhost:5432`
- Node.js 18+
- Groq API key (get one free at [console.groq.com](https://console.groq.com))

### 1. Database Setup
```sql
CREATE DATABASE coderefine;
```

### 2. Backend
```bash
cd stram-backend

# Set your Groq API key (Windows)
set GROQ_API_KEY=gsk_your_key_here

mvn spring-boot:run
# Starts on http://localhost:8000
```

### 3. Frontend
```bash
cd coderefine-ui
npm install
npm run dev
# Starts on http://localhost:5173 (proxied to :8000)
```

## Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key (required) |
| `spring.datasource.url` | PostgreSQL URL |
| `spring.datasource.username` | DB username |
| `spring.datasource.password` | DB password |
| `app.jwt.secret` | JWT signing key (change in production) |

## Supported Languages

Python · JavaScript · Java · C++ · C · HTML · CSS
