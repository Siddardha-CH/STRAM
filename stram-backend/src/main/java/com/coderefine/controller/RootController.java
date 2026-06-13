package com.coderefine.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of(
                "message", "CodeRefine API v2.0 is running",
                "status", "ok",
                "stack", "Spring Boot + PostgreSQL"
        );
    }
}
