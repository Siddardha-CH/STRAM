export interface User {
    id: number;
    username: string;
    email: string;
    created_at: string;
    review_count: number;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    username: string;
    email: string;
}

export interface Issue {
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    title: string;
    line_hint?: string;
    description: string;
    suggestion?: string;
}

export interface ReviewSummary {
    score: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    overview: string;
}

export interface ReviewResult {
    review_id?: number;
    summary: ReviewSummary;
    issues: Issue[];
    refactored_code: string;
    improvements: string[];
}

export interface ReviewHistory {
    id: number;
    language: string;
    score: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    created_at: string;
    original_code: string;
    refactored_code?: string;
    issues_json?: string;
}

export interface Stats {
    total: number;
    avg_score: number;
    total_issues: number;
    languages: Record<string, number>;
}

export interface ConversionResult {
    converted_code: string;
    complexity_analysis: {
        original_time: string;
        original_space: string;
        new_time: string;
        new_space: string;
    };
    explanation: string;
}

export type Language = 'python' | 'javascript' | 'java' | 'cpp' | 'c' | 'html' | 'css';
export type Section = 'dashboard' | 'review' | 'history' | 'converter';
export type ResultTab = 'analysis' | 'refactored' | 'improvements';
