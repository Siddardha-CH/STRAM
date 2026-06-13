package com.coderefine.dto;

public class AuthResponse {
    private String access_token;
    private String token_type;
    private String username;
    private String email;

    public AuthResponse(String access_token, String token_type, String username, String email) {
        this.access_token = access_token;
        this.token_type = token_type;
        this.username = username;
        this.email = email;
    }

    public String getAccess_token() { return access_token; }
    public String getToken_type() { return token_type; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
}
