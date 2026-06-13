package com.coderefine.dto;

import jakarta.validation.constraints.NotBlank;

public class CodeSubmission {
    @NotBlank
    private String code;
    @NotBlank
    private String language;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
