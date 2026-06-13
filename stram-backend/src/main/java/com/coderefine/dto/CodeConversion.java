package com.coderefine.dto;

import jakarta.validation.constraints.NotBlank;

public class CodeConversion {
    @NotBlank
    private String code;
    @NotBlank
    private String target_language;
    private String source_language;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getTarget_language() { return target_language; }
    public void setTarget_language(String target_language) { this.target_language = target_language; }
    public String getSource_language() { return source_language; }
    public void setSource_language(String source_language) { this.source_language = source_language; }
}
