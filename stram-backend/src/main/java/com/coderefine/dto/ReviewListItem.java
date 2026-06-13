package com.coderefine.dto;

import java.time.LocalDateTime;

public class ReviewListItem {
    private Long id;
    private String language;
    private double score;
    private int critical_count;
    private int high_count;
    private int medium_count;
    private int low_count;
    private LocalDateTime created_at;
    private String original_code;
    private String refactored_code;
    private String issues_json;

    public ReviewListItem(Long id, String language, double score,
                          int critical_count, int high_count, int medium_count, int low_count,
                          LocalDateTime created_at, String original_code,
                          String refactored_code, String issues_json) {
        this.id = id;
        this.language = language;
        this.score = score;
        this.critical_count = critical_count;
        this.high_count = high_count;
        this.medium_count = medium_count;
        this.low_count = low_count;
        this.created_at = created_at;
        this.original_code = original_code;
        this.refactored_code = refactored_code;
        this.issues_json = issues_json;
    }

    public Long getId() { return id; }
    public String getLanguage() { return language; }
    public double getScore() { return score; }
    public int getCritical_count() { return critical_count; }
    public int getHigh_count() { return high_count; }
    public int getMedium_count() { return medium_count; }
    public int getLow_count() { return low_count; }
    public LocalDateTime getCreated_at() { return created_at; }
    public String getOriginal_code() { return original_code; }
    public String getRefactored_code() { return refactored_code; }
    public String getIssues_json() { return issues_json; }
}
