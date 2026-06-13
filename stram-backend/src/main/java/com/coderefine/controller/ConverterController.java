package com.coderefine.controller;

import com.coderefine.dto.CodeConversion;
import com.coderefine.model.User;
import com.coderefine.service.AiService;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class ConverterController {

    private final AiService aiService;

    public ConverterController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/convert")
    public ResponseEntity<JsonNode> convertCode(
            @Valid @RequestBody CodeConversion request,
            @AuthenticationPrincipal User user) {

        if (request.getCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code cannot be empty");
        }

        JsonNode result = aiService.convertCode(request.getCode(), request.getTarget_language());
        return ResponseEntity.ok(result);
    }
}
