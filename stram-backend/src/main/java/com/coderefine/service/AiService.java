package com.coderefine.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    @Value("${app.groq.api-key}")
    private String groqApiKey;

    @Value("${app.groq.model}")
    private String model;

    @Value("${app.groq.api-url}")
    private String groqApiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public JsonNode reviewCode(String code, String language) {
        String systemPrompt = String.format("""
                You are an expert Senior Software Engineer performing a thorough code review.
                Analyze the provided %s code and return a STRICTLY valid JSON object.

                The JSON must follow this exact structure:
                {
                    "summary": {
                        "score": <integer 0-100 representing overall code quality>,
                        "critical": <count of critical severity issues>,
                        "high": <count of high severity issues>,
                        "medium": <count of medium severity issues>,
                        "low": <count of low severity issues>,
                        "overview": "<2-3 sentence summary of the code quality>"
                    },
                    "issues": [
                        {
                            "severity": "critical" | "high" | "medium" | "low",
                            "category": "Bug" | "Security" | "Performance" | "Best Practice" | "Maintainability",
                            "title": "<concise issue title>",
                            "line_hint": "<approximate line or function name where issue occurs>",
                            "description": "<clear explanation of why this is a problem>",
                            "suggestion": "<exact code snippet showing the fix>"
                        }
                    ],
                    "refactored_code": "<the complete rewritten code string>",
                    "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
                }

                Rules:
                - Output ONLY the raw JSON, no markdown code fences.
                - The refactored_code field MUST contain the actual full code, not a URL.
                - Be thorough but accurate. Do not invent issues that do not exist.
                - Score 90-100 for excellent code, 70-89 for good, 50-69 for fair, below 50 for poor.
                """, language);

        String userPrompt = String.format("Please review this %s code:\n\n```%s\n%s\n```", language, language, code);

        try {
            return callGroq(systemPrompt, userPrompt, true);
        } catch (Exception e) {
            log.error("Code review AI call failed: {}", e.getMessage());
            return buildErrorResponse(e.getMessage());
        }
    }

    public JsonNode convertCode(String code, String targetLanguage) {
        String systemPrompt = String.format("""
                You are an expert Senior Software Engineer.
                Convert the provided code to %s and optimize it.

                Return STRICTLY valid JSON with this structure:
                {
                    "converted_code": "<the full converted code as a string>",
                    "complexity_analysis": {
                        "original_time": "<estimated time complexity of original>",
                        "original_space": "<estimated space complexity of original>",
                        "new_time": "<estimated time complexity of new code>",
                        "new_space": "<estimated space complexity of new code>"
                    },
                    "explanation": "<brief explanation of changes and optimizations>"
                }

                Rules:
                - Output ONLY the raw JSON.
                - Ensure the converted code is idiomatic %s.
                """, targetLanguage, targetLanguage);

        String userPrompt = "Convert this code to " + targetLanguage + " and optimize it:\n\n" + code;

        try {
            return callGroq(systemPrompt, userPrompt, true);
        } catch (Exception e) {
            log.error("Code conversion AI call failed: {}", e.getMessage());
            ObjectNode err = objectMapper.createObjectNode();
            err.put("converted_code", "// Error converting code: " + e.getMessage());
            ObjectNode complexity = err.putObject("complexity_analysis");
            complexity.put("original_time", "N/A");
            complexity.put("original_space", "N/A");
            complexity.put("new_time", "N/A");
            complexity.put("new_space", "N/A");
            err.put("explanation", "Conversion failed due to an error.");
            return err;
        }
    }

    private JsonNode callGroq(String systemPrompt, String userPrompt, boolean jsonMode) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", model);
        body.put("temperature", 0.1);
        body.put("max_tokens", 4096);

        if (jsonMode) {
            body.putObject("response_format").put("type", "json_object");
        }

        ArrayNode messages = body.putArray("messages");
        messages.addObject().put("role", "system").put("content", systemPrompt);
        messages.addObject().put("role", "user").put("content", userPrompt);

        HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);
        ResponseEntity<String> response = restTemplate.exchange(groqApiUrl, HttpMethod.POST, request, String.class);

        JsonNode root = objectMapper.readTree(response.getBody());
        String content = root.path("choices").get(0).path("message").path("content").asText();
        return objectMapper.readTree(content);
    }

    private JsonNode buildErrorResponse(String message) {
        ObjectNode node = objectMapper.createObjectNode();
        ObjectNode summary = node.putObject("summary");
        summary.put("score", 0);
        summary.put("critical", 1);
        summary.put("high", 0);
        summary.put("medium", 0);
        summary.put("low", 0);
        summary.put("overview", "Analysis failed due to an error.");

        ArrayNode issues = node.putArray("issues");
        ObjectNode issue = issues.addObject();
        issue.put("severity", "critical");
        issue.put("category", "Bug");
        issue.put("title", "Analysis Failed");
        issue.put("line_hint", "N/A");
        issue.put("description", message);
        issue.put("suggestion", "Please try again.");

        node.put("refactored_code", "// Error: Could not generate refactored code.");
        node.putArray("improvements");
        return node;
    }
}
