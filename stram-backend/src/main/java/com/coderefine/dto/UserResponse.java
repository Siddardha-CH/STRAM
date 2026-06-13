package com.coderefine.dto;

import java.time.LocalDateTime;

public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private LocalDateTime created_at;
    private long review_count;

    public UserResponse(Long id, String username, String email, LocalDateTime created_at, long review_count) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.created_at = created_at;
        this.review_count = review_count;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public LocalDateTime getCreated_at() { return created_at; }
    public long getReview_count() { return review_count; }
}
